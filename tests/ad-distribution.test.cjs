const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const Module = require("node:module");
const esbuild = require("esbuild");
const root = path.resolve(__dirname, "..");
function load(file, stubs = {}) {
  const code = esbuild.buildSync({
    entryPoints: [path.join(root, file)],
    bundle: true,
    packages: "external",
    platform: "node",
    format: "cjs",
    write: false,
    external: Object.keys(stubs),
  }).outputFiles[0].text;
  const result = new Module(path.join(__dirname, "__retail.cjs"), module);
  result.filename = path.join(__dirname, "__retail.cjs");
  result.paths = Module._nodeModulePaths(__dirname);
  result.require = (name) =>
    Object.hasOwn(stubs, name) ? stubs[name] : module.require(name);
  result._compile(code, result.filename);
  return result.exports;
}
const ads = load("convex/ads.ts");
const policy = load("lib/ad-policy.ts");
function database(initial = [], userId = "seller") {
  let records = new Map(initial.map((row) => [row._id, structuredClone(row)]));
  let counter = 100;
  const jobs = [];
  const db = {
    get: async (id) => structuredClone(records.get(id) || null),
    insert: async (table, value) => {
      const id = `${table}:${++counter}`;
      records.set(id, {
        ...structuredClone(value),
        _id: id,
        _creationTime: Date.now(),
      });
      return id;
    },
    patch: async (id, value) => {
      assert.ok(records.has(id), `Record ${id} exists`);
      records.set(id, { ...records.get(id), ...structuredClone(value) });
    },
    delete: async (id) => records.delete(id),
    query(table) {
      let filters = [];
      const query = {
        withIndex(name, fn) {
          if (fn)
            fn({
              eq(field, value) {
                filters.push([field, value]);
                return this;
              },
            });
          return query;
        },
        take: async (count) => (await query.collect()).slice(0, count),
        order() {
          return query;
        },
        collect: async () =>
          [...records.values()]
            .filter(
              (row) =>
                row._id.startsWith(table + ":") &&
                filters.every(([field, value]) => row[field] === value),
            )
            .map((row) => structuredClone(row)),
        unique: async () => {
          const rows = await query.collect();
          assert.ok(rows.length <= 1);
          return rows[0] || null;
        },
        first: async () => (await query.collect())[0] || null,
      };
      return query;
    },
  };
  db.system = { get: db.get };
  const ctx = {
    db,
    auth: {
      getUserIdentity: async () => (userId ? { subject: userId } : null),
    },
    storage: { getUrl: async (id) => `https://example.test/${id}` },
    scheduler: {
      runAfter: async (delay, ref, args) => jobs.push({ delay, args }),
    },
  };
  const { getFunctionName } = require("convex/server");
  for (const kind of ["runQuery", "runMutation"]) ctx[kind] = async (ref, args) => {
    const name = getFunctionName(ref).split(":")[1];
    return ads[name]._handler(ctx, args);
  };
  return {
    ctx,
    jobs,
    get: (id) => structuredClone(records.get(id)),
    all: (table) =>
      [...records.values()].filter((row) => row._id.startsWith(table + ":")),
    async run(fn, args) {
      const before = structuredClone([...records]);
      const jobsBefore = jobs.length;
      try {
        return await fn._handler(ctx, args);
      } catch (error) {
        records = new Map(before);
        jobs.length = jobsBefore;
        throw error;
      }
    },
  };
}
const now = Date.now();
const month = policy.adNetworkMonth(now);
const entitlement = (userId, plan = "pro") => ({ _id: `adEntitlements:${userId}`, userId, plan, expiresAt: now + 180000 });
const campaign = (id = "adCampaigns:a", extra = {}) => ({ _id: id, userId: "advertiser", title: "Novidades", adText: "Conheça nossa seleção.", productLink: "https://example.com/produto", niche: "pets", mediaUrls: ["https://example.com/image.png"], mediaTypes: ["image"], status: "active", views: 0, clicks: 0, maxViewsLimit: 1000, lastResetMonth: month, createdAt: now, ...extra });
const mainPage = (extra = {}) => ({ _id: "usernames:page", userId: "owner", username: "loja", niche: "vestuario", ...extra });
const sessionId = "session-1234567890123456";
const placement = (extra = {}) => ({ _id: "adPlacements:p", campaignId: "adCampaigns:a", username: "loja", sessionId, createdAt: now - 2000, expiresAt: now + 60000, viewed: false, clicked: false, ...extra });
function distribution(rows = []) { return database([mainPage(), campaign(), entitlement("owner", "free"), entitlement("advertiser"), ...rows]); }
const reserve = (db, extra = {}) => db.run(ads.reservePlacement, { username: "loja", sessionId, advertiserIds: ["advertiser"], ...extra });
const draft = (extra = {}) => ({ userId: "advertiser", plan: "pro", title: "Coleção", adText: "Conheça nossa seleção.", productLink: "https://example.com", niche: "vestuario", mediaStorageIds: ["_storage:one"], mediaTypes: ["video"], ...extra });
const media = { _id: "_storage:one", contentType: "image/png", size: 2000 };

test("taxonomy normalizes aliases and blocks related businesses, including fitness clothing", () => {
  assert.equal(policy.networkCategory("CALÇADOS"), "vestuario");
  assert.equal(policy.networkCategory("não sei"), "geral");
  assert.deepEqual(policy.businessSegments("fitness", "Leggings para academia"), ["fitness", "vestuario"]);
  assert.equal(policy.competingSegments(["vestuario"], policy.businessSegments("fitness", "Leggings para academia")), true);
  assert.equal(policy.competingSegments(["fitness"], ["esportes"]), true);
  assert.equal(policy.competingSegments(["vestuario"], ["pets"]), false);
  assert.equal(policy.safeAdDestination("https://login:password@example.com"), null);
});
test("reservation does not count impressions and repeated refreshes reserve nothing", async () => {
  const db = distribution(); const result = await reserve(db);
  assert.ok(result?.placementId); assert.equal(db.get("adCampaigns:a").views, 0);
  assert.equal(await reserve(db), null); assert.equal(db.jobs.length, 1);
});
test("same and related segments, undefined pages/campaigns, own account, Ultra and unavailable plans never receive placements", async () => {
  for (const rows of [
    [campaign(undefined, { niche: "calcados" })],
    [mainPage({ niche: "fitness" }), campaign(undefined, { niche: "esportes" })],
    [mainPage({ niche: "vestuario" }), campaign(undefined, { niche: "fitness", title: "Leggings" })],
    [mainPage({ niche: "geral" })], [campaign(undefined, { niche: "geral" })],
    [campaign(undefined, { userId: "owner" })], [entitlement("owner", "ultra")],
    [entitlement("owner", "free"), { ...entitlement("owner"), expiresAt: now - 1 }],
  ]) assert.equal(await reserve(distribution(rows)), null);
});
test("secondary pages inherit the owner exclusion", async () => {
  const db = distribution([mainPage({ userId: "sub-1" }), { _id: "subAccounts:one", subUserId: "sub-1", ownerUserId: "advertiser" }]);
  assert.equal(await reserve(db), null);
});
test("profile descriptions and link titles contribute additional competitive segments", async () => {
  const db = distribution([{ _id: "userCustomizations:one", userId: "owner", description: "Ração e cuidados pets" }]);
  assert.equal(await reserve(db), null);
});
test("fair rotation prefers a campaign with a lower share of consumed quota", async () => {
  const db = distribution([campaign(undefined, { views: 900 }), campaign("adCampaigns:b", { userId: "advertiser", views: 50, maxViewsLimit: 5000 })]);
  assert.equal((await reserve(db)).id, "adCampaigns:b");
});
test("impression requires time, matching session and a current eligible placement", async () => {
  for (const value of [placement({ createdAt: Date.now() }), placement({ expiresAt: now - 1 }), placement({ sessionId: "different-session" })]) {
    const db = distribution([value]); assert.equal(await db.run(ads.confirmAdView, { placementId: value._id, sessionId }), false); assert.equal(db.get("adCampaigns:a").views, 0);
  }
});
test("visible impressions and their clicks count once, and legacy or pre-view clicks do not count", async () => {
  const db = distribution([placement()]);
  assert.equal(await db.run(ads.registerAdClick, { id: "adCampaigns:a" }), false);
  assert.equal(await db.run(ads.registerAdClick, { placementId: "adPlacements:p", sessionId }), false);
  assert.equal(await db.run(ads.confirmAdView, { placementId: "adPlacements:p", sessionId }), true);
  assert.equal(await db.run(ads.confirmAdView, { placementId: "adPlacements:p", sessionId }), true);
  assert.equal(db.get("adCampaigns:a").views, 1);
  assert.equal(await db.run(ads.registerAdClick, { placementId: "adPlacements:p", sessionId }), true);
  assert.equal(await db.run(ads.registerAdClick, { placementId: "adPlacements:p", sessionId }), false);
  assert.equal(db.get("adCampaigns:a").clicks, 1);
});
test("paused, deleted, reclassified and newly Ultra pages reject outstanding impressions", async () => {
  for (const rows of [[campaign(undefined, { status: "paused" })], [campaign(undefined, { niche: "vestuario" })], [mainPage({ niche: "geral" })], [entitlement("owner", "ultra")]]) {
    const db = distribution([...rows, placement()]); assert.equal(await db.run(ads.confirmAdView, { placementId: "adPlacements:p", sessionId }), false);
  }
  const db = distribution([placement()]); await db.ctx.db.delete("adCampaigns:a"); assert.equal(await db.run(ads.confirmAdView, { placementId: "adPlacements:p", sessionId }), false);
});
test("quota is capped even when two placements exist and an active old-month campaign resets safely", async () => {
  const db = distribution([campaign(undefined, { views: 999 }), placement(), placement({ _id: "adPlacements:q", sessionId: "session-two" })]);
  await db.run(ads.confirmAdView, { placementId: "adPlacements:p", sessionId });
  assert.equal(db.get("adCampaigns:a").status, "completed");
  assert.equal(await db.run(ads.confirmAdView, { placementId: "adPlacements:q", sessionId: "session-two" }), false);
  assert.equal(db.get("adCampaigns:a").views, 1000);
  const next = distribution([campaign(undefined, { lastResetMonth: "2020-01", views: 1000 }), placement()]);
  await next.run(ads.confirmAdView, { placementId: "adPlacements:p", sessionId }); assert.equal(next.get("adCampaigns:a").views, 1);
});
test("other accounts cannot change a profile niche; subaccounts work and confirmed choices survive suggestions", async () => {
  const db = database([mainPage(), { _id: "subAccounts:one", subUserId: "sub-1", ownerUserId: "owner" }, mainPage({ _id: "usernames:child", userId: "sub-1", username: "child" })], "owner");
  await db.run(ads.saveUserNiche, { username: "child", niche: "pets", confirmed: true });
  await db.run(ads.saveUserNiche, { username: "child", niche: "fitness" });
  assert.equal(db.get("usernames:child").niche, "pets");
  const attacker = database([mainPage()], "attacker");
  await assert.rejects(attacker.run(ads.saveUserNiche, { username: "loja", niche: "pets" }), /não pertence/);
});
test("campaign creation enforces the verified plan, count and actual media type, not client assertions", async () => {
  const db = database([media]); const id = await db.run(ads.createVerifiedCampaign, draft({ userPlan: "ultra" }));
  assert.equal(db.get(id).maxViewsLimit, 1000); assert.deepEqual(db.get(id).mediaTypes, ["image"]);
  const full = database([media, campaign(), campaign("adCampaigns:b")]);
  await assert.rejects(full.run(ads.createVerifiedCampaign, draft()), /limite/);
  await assert.rejects(db.run(ads.createVerifiedCampaign, draft({ niche: "geral" })), /segmento/);
  await assert.rejects(db.run(ads.createVerifiedCampaign, draft({ mediaStorageIds: ["_storage:missing"] })), /mídias|imagens/);
});
test("public action resolves plans on the server and Free cannot forge an Ultra creation", async () => {
  const db = distribution();
  assert.ok(await db.run(ads.selectAdForPage, { username: "loja", sessionId }));
  const free = database([entitlement("seller", "free")]);
  await assert.rejects(free.run(ads.publishCampaign, { ...draft(), userPlan: "ultra" }), /Pro ou Ultra/);
});
test("expired placement cleanup preserves campaign metrics", async () => {
  const db = distribution([placement(), campaign(undefined, { views: 100, clicks: 5 })]);
  await db.run(ads.removePlacement, { id: "adPlacements:p" });
  assert.equal(db.get("adPlacements:p"), undefined); assert.equal(db.get("adCampaigns:a").views, 100);
});

test("visibility threshold resets on scrolling/backgrounding and fires only once", () => {
  const { observeAdVisibility } = load("lib/ad-visibility.ts");
  const original = { document: global.document, observer: global.IntersectionObserver, setTimeout: global.setTimeout, clearTimeout: global.clearTimeout };
  let callback, change, disconnect = false, sent = 0, timer, next = 0;
  global.document = { visibilityState: "visible", addEventListener: (_type, fn) => change = fn, removeEventListener: () => change = null };
  global.IntersectionObserver = class { constructor(fn) { callback = fn; } observe() {} disconnect() { disconnect = true; } };
  global.setTimeout = (fn, delay) => { assert.equal(delay, 1000); timer = fn; return ++next; };
  global.clearTimeout = () => { timer = null; };
  try {
    const stop = observeAdVisibility({}, () => sent++);
    callback([{ isIntersecting: true, intersectionRatio: .49 }]); assert.equal(timer, null);
    callback([{ isIntersecting: true, intersectionRatio: .5 }]); assert.ok(timer);
    global.document.visibilityState = "hidden"; change(); assert.equal(timer, null);
    global.document.visibilityState = "visible"; change(); assert.ok(timer);
    callback([{ isIntersecting: false, intersectionRatio: 0 }]); assert.equal(timer, null);
    callback([{ isIntersecting: true, intersectionRatio: .9 }]); timer(); assert.equal(sent, 1);
    callback([{ isIntersecting: true, intersectionRatio: .9 }]); assert.equal(timer, null);
    stop(); assert.equal(disconnect, true); assert.equal(change, null);
  } finally { Object.assign(global, { document: original.document, IntersectionObserver: original.observer, setTimeout: original.setTimeout, clearTimeout: original.clearTimeout }); }
});

test("plan cache is checked server-side and provider failure keeps public profiles ad-free", async () => {
  const db = distribution([{ ...entitlement("owner"), expiresAt: now - 1 }]);
  const savedKey = process.env.CLERK_SECRET_KEY, savedFetch = global.fetch;
  process.env.CLERK_SECRET_KEY = "test-fixture-not-a-real-key";
  let calls = 0;
  global.fetch = async () => { calls++; return { ok: true, json: async () => ({ public_metadata: { subscriptionPlan: "ultra" } }) }; };
  try {
    assert.equal(await db.run(ads.selectAdForPage, { username: "loja", sessionId }), null);
    assert.equal(calls, 1); assert.equal(db.get("adEntitlements:owner").plan, "ultra");
    await db.run(ads.selectAdForPage, { username: "loja", sessionId }); assert.equal(calls, 1);
    const failing = distribution([{ ...entitlement("owner"), expiresAt: now - 1 }]);
    global.fetch = async () => { throw new Error("offline"); };
    assert.equal(await failing.run(ads.selectAdForPage, { username: "loja", sessionId }), null);
    assert.equal(failing.all("adPlacements").length, 0);
  } finally { global.fetch = savedFetch; if (savedKey === undefined) delete process.env.CLERK_SECRET_KEY; else process.env.CLERK_SECRET_KEY = savedKey; }
});

test("cached clients cannot publish a forged plan or consume impressions through retired endpoints", async () => {
  const db = distribution();
  assert.equal(await db.run(ads.getAdForPublicPage, { pageOwnerPlan: "free", pageOwnerNiche: "geral" }), null);
  await assert.rejects(db.run(ads.createCampaign, draft({ userPlan: "ultra" })), /Atualize esta página/);
  assert.equal(db.get("adCampaigns:a").views, 0);
});

test("server media validation accepts supported phone formats and rejects empty or oversized assets", async () => {
  for (const [contentType, expected] of [["image/avif", "image"], ["video/quicktime", "video"]]) {
    const db = database([{ ...media, contentType }]);
    const id = await db.run(ads.createVerifiedCampaign, draft());
    assert.equal(db.get(id).mediaTypes[0], expected);
  }
  for (const patch of [{ size: 0 }, { size: 11 * 1024 * 1024 }, { contentType: "image/svg+xml" }]) {
    const db = database([{ ...media, ...patch }]);
    await assert.rejects(db.run(ads.createVerifiedCampaign, draft()), /imagens válidas/);
  }
});
test("appearance category saves the selected page explicitly, including Free accounts", async () => {
  let received;
  const react = require("react");
  const component = load("components/page-editor/PageAdCategory.tsx", {
    "react": { ...react, useState: value => [value, () => {}], useRef: value => ({ current: value }) },
    "convex/react": { useConvexAuth: () => ({ isAuthenticated: true }), useQuery: () => [{ username: "second-page", niche: "geral" }], useMutation: () => async args => { received = args; } },
    "./editor.module.css": { __esModule: true, default: {} },
  });
  const tree = component.default({ username: "second-page" });
  const select = react.Children.toArray(tree.props.children).find(child => child.type === "select");
  assert.equal(select.props.disabled, false);
  await select.props.onChange({ target: { value: "vestuario" } });
  assert.deepEqual(received, { username: "second-page", niche: "vestuario", confirmed: true });
});
