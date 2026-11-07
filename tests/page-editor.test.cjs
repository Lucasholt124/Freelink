const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const Module = require("node:module");
const esbuild = require("esbuild");

// Exercise the real Convex handlers without network access or user data.
const project = path.resolve(__dirname, "..");
function bundle(relative, mocks = {}) {
  const output = esbuild.buildSync({
    entryPoints: [path.join(project, relative)],
    bundle: true,
    platform: "node",
    format: "cjs",
    packages: "external",
    write: false,
  }).outputFiles[0].text;
  const filename = path.join(project, "tests", "__page-editor-test-bundle.cjs");
  const loaded = new Module(filename, module);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = loaded.require.bind(loaded);
  loaded.require = (name) =>
    Object.hasOwn(mocks, name) ? mocks[name] : originalRequire(name);
  loaded._compile(output, filename);
  return loaded.exports;
}
const api = bundle("convex/pageWorkspaces.ts");
const helper = bundle("lib/page-editor.ts");
const legacy = bundle("convex/lib/subAccounts.ts");
const { normalizeLinkUrl, usernameError } = bundle(
  "convex/lib/onboarding_utils.ts",
);

function database() {
  const tables = new Map();
  let sequence = 0;
  const rows = (table) => {
    if (!tables.has(table)) tables.set(table, new Map());
    return tables.get(table);
  };
  const copy = (value) => (value == null ? value : structuredClone(value));
  return {
    rows: (table) => [...rows(table).values()].map(copy),
    async insert(table, values) {
      const id = `${table}:${++sequence}`;
      rows(table).set(id, {
        ...copy(values),
        _id: id,
        _creationTime: sequence,
      });
      return id;
    },
    async get(id) {
      return copy(rows(id.split(":")[0]).get(id) ?? null);
    },
    async delete(id) {
      rows(id.split(":")[0]).delete(id);
    },
    async patch(id, values) {
      const record = rows(id.split(":")[0]).get(id);
      assert.ok(record, `Missing record ${id}`);
      for (const [key, value] of Object.entries(values)) {
        if (value === undefined) delete record[key];
        else record[key] = copy(value);
      }
    },
    query(table) {
      const filters = [];
      let direction = "asc";
      const matches = () =>
        [...rows(table).values()]
          .filter((record) =>
            filters.every(([key, value]) => record[key] === value),
          )
          .sort(
            (a, b) =>
              ((a.order ?? a._creationTime) - (b.order ?? b._creationTime)) *
              (direction === "desc" ? -1 : 1),
          );
      return {
        withIndex(name, callback) {
          const builder = {
            eq(key, value) {
              filters.push([key, value]);
              return builder;
            },
          };
          callback(builder);
          return this;
        },
        order(value) {
          direction = value;
          return this;
        },
        async unique() {
          const found = matches();
          assert.ok(found.length <= 1);
          return copy(found[0] ?? null);
        },
        async first() {
          return copy(matches()[0] ?? null);
        },
        async collect() {
          return matches().map(copy);
        },
      };
    },
  };
}

function context(db = database(), userId = "test-user") {
  return {
    db,
    auth: {
      async getUserIdentity() {
        return userId ? { subject: userId } : null;
      },
    },
    storage: {
      async getUrl(id) {
        return `https://test.invalid/${id}`;
      },
    },
  };
}
const run = (name, ctx, args = {}) => api[name]._handler(ctx, args);
const pageArgs = {
  ownerId: "test-user",
  plan: "pro",
  username: "marca-verde",
  displayName: "Marca Verde",
  accentColor: "#17724a",
  backgroundColor1: "#f0f7f2",
  backgroundColor2: "#c9e0cf",
};
const linkArgs = (userId) => ({
  userId,
  title: "Meu catálogo",
  url: "https://example.com/",
  isFeatured: false,
  badgeType: null,
  clearThumbnail: false,
});
const appearanceArgs = (userId) => ({
  userId,
  displayName: "Minha loja",
  bio: "Catálogo da loja",
  status: "",
  accentColor: "#b45435",
  backgroundType: "color",
  backgroundStyle: "full",
  backgroundColor1: "#fcf3ed",
  backgroundColor2: "#edc7b3",
  backgroundImageBlur: 0,
  backgroundImageOpacity: 100,
  clearPhoto: false,
  clearBackground: false,
});

test("catalog and editor reject unauthenticated or foreign page access", async () => {
  const ctx = context();
  const child = await run("createOwnedPage", ctx, pageArgs);
  assert.equal((await run("getMyPages", ctx)).length, 2);
  await assert.rejects(
    run("getMyPages", context(ctx.db, null)),
    /Entre na sua conta/,
  );
  await assert.rejects(
    run("getEditorData", context(ctx.db, "other-user"), {
      userId: child.userId,
    }),
    /não pertence/,
  );
  await assert.rejects(
    run(
      "saveAppearance",
      context(ctx.db, "other-user"),
      appearanceArgs(child.userId),
    ),
    /não pertence/,
  );
});
test("independent page identities save only to the selected page", async () => {
  const ctx = context();
  const child = await run("createOwnedPage", ctx, pageArgs);
  await run("saveAppearance", ctx, appearanceArgs("test-user"));
  const before = await run("getEditorData", ctx, { userId: "test-user" });
  await run("saveAppearance", ctx, {
    ...appearanceArgs(child.userId),
    displayName: "Outra marca",
    accentColor: "#2257a5",
  });
  assert.deepEqual(
    await run("getEditorData", ctx, { userId: "test-user" }),
    before,
  );
  const childData = await run("getEditorData", ctx, { userId: child.userId });
  assert.equal(childData.profile.accentColor, "#2257a5");
  assert.equal(
    (await ctx.db.get(ctx.db.rows("subAccounts")[0]._id)).displayName,
    "Outra marca",
  );
});
test("rename keeps both address records consistent and rejects collisions", async () => {
  const ctx = context();
  const child = await run("createOwnedPage", ctx, pageArgs);
  await ctx.db.insert("usernames", { userId: "other", username: "ocupado" });
  await assert.rejects(
    run("renamePage", ctx, { userId: child.userId, username: "ocupado" }),
    /já está em uso/,
  );
  await run("renamePage", ctx, {
    userId: child.userId,
    username: "nova-marca",
  });
  assert.equal(ctx.db.rows("subAccounts")[0].username, "nova-marca");
  assert.equal(
    ctx.db.rows("usernames").find((x) => x.userId === child.userId).username,
    "nova-marca",
  );
});
test("links cannot be moved, edited or deleted through another page even with same owner", async () => {
  const ctx = context();
  const child = await run("createOwnedPage", ctx, pageArgs);
  const first = await run("saveLink", ctx, linkArgs("test-user"));
  await assert.rejects(
    run("saveLink", ctx, { ...linkArgs(child.userId), linkId: first }),
    /não pertence/,
  );
  await assert.rejects(
    run("deleteLink", ctx, { userId: child.userId, linkId: first }),
    /não pertence/,
  );
  await assert.rejects(
    run("reorderLinks", ctx, { userId: child.userId, linkIds: [first] }),
    /lista mudou/,
  );
  assert.equal((await ctx.db.get(first)).userId, "test-user");
});
test("reordering requires exact set and persists new order", async () => {
  const ctx = context();
  const a = await run("saveLink", ctx, linkArgs("test-user"));
  const b = await run("saveLink", ctx, linkArgs("test-user"));
  await assert.rejects(
    run("reorderLinks", ctx, { userId: "test-user", linkIds: [a, a] }),
    /lista mudou/,
  );
  await assert.rejects(
    run("reorderLinks", ctx, { userId: "test-user", linkIds: [b] }),
    /lista mudou/,
  );
  await run("reorderLinks", ctx, { userId: "test-user", linkIds: [b, a] });
  assert.deepEqual(
    (await run("getEditorData", ctx, { userId: "test-user" })).links.map(
      (x) => x._id,
    ),
    [b, a],
  );
});
test("server denies unsafe destinations and invalid appearance without writing", async () => {
  const ctx = context();
  await assert.rejects(
    run("saveLink", ctx, {
      ...linkArgs("test-user"),
      url: "javascript:alert(1)",
    }),
    /endereço válido/,
  );
  await assert.rejects(
    run("saveAppearance", ctx, {
      ...appearanceArgs("test-user"),
      accentColor: "red",
    }),
    /cores válidas/,
  );
  await assert.rejects(
    run("saveAppearance", ctx, {
      ...appearanceArgs("test-user"),
      backgroundImageBlur: NaN,
    }),
    /ajustes/,
  );
  assert.equal(ctx.db.rows("links").length, 0);
  assert.equal(ctx.db.rows("userCustomizations").length, 0);
});
test("additional page quotas are checked atomically using server plan", async () => {
  const ctx = context();
  await assert.rejects(
    run("createOwnedPage", ctx, { ...pageArgs, plan: "free" }),
    /Pro e Ultra/,
  );
  for (let i = 0; i < 10; i++)
    await run("createOwnedPage", ctx, { ...pageArgs, username: `marca-${i}` });
  await assert.rejects(
    run("createOwnedPage", ctx, { ...pageArgs, username: "outra-marca" }),
    /limite/,
  );
  assert.equal(helper.extraPageLimit("ultra"), 30);
  assert.equal(helper.extraPageLimit("free", true), 999);
});
test("action reads trusted Clerk metadata and rejects failures", async () => {
  const saved = process.env.CLERK_SECRET_KEY,
    oldFetch = global.fetch;
  try {
    process.env.CLERK_SECRET_KEY = "sk_test_unit_fixture\n";
    let metadata = "free",
      received;
    global.fetch = async (url, init) => {
      assert.equal(init.headers.Authorization, "Bearer sk_test_unit_fixture");
      return {
        ok: true,
        json: async () => ({ public_metadata: { subscriptionPlan: metadata } }),
      };
    };
    const ctx = context();
    ctx.runMutation = async (ref, args) => {
      received = args;
      return run("createOwnedPage", ctx, args);
    };
    const { ownerId, plan, ...args } = pageArgs;
    await assert.rejects(run("createPage", ctx, args), /Pro e Ultra/);
    metadata = "Pro";
    await run("createPage", ctx, args);
    assert.equal(received.plan, "pro");
    assert.equal(received.ownerId, "test-user");
    global.fetch = async () => ({ ok: false });
    await assert.rejects(run("createPage", ctx, args), /confirmar seu plano/);
    delete process.env.CLERK_SECRET_KEY;
    await assert.rejects(
      run("createPage", ctx, args),
      /temporariamente indisponível/,
    );
  } finally {
    global.fetch = oldFetch;
    if (saved === undefined) delete process.env.CLERK_SECRET_KEY;
    else process.env.CLERK_SECRET_KEY = saved;
  }
});
test("legacy creation cannot bypass new server plan enforcement", async () => {
  await assert.rejects(
    legacy.createSubAccount._handler(context(), {}),
    /novo editor/,
  );
});
test("quick destination fields preserve WhatsApp messages and complex tracking URLs", () => {
  const url = helper.buildLinkDestination(
    "whatsapp",
    "+55 (11) 99999-8888",
    "Olá, quero o catálogo!",
  );
  const parsed = helper.destinationFields(url);
  assert.equal(parsed.kind, "whatsapp");
  assert.equal(
    helper.buildLinkDestination(parsed.kind, parsed.address, parsed.message),
    url,
  );
  for (const raw of [
    "https://instagram.com/minhamarca/?utm_source=bio",
    "mailto:loja@example.com?subject=Pedido",
    "https://wa.me/5511999998888?text=Oi&app_absent=0",
  ]) {
    assert.equal(helper.destinationFields(raw).address, raw);
    assert.equal(helper.destinationFields(raw).kind, "site");
  }
  assert.equal(
    helper.buildLinkDestination("instagram", "@minha.loja"),
    "https://www.instagram.com/minha.loja/",
  );
  assert.equal(
    helper.buildLinkDestination("site", "javascript:alert(1)"),
    null,
  );
});

test("deleting an additional page requires its owner and preserves other pages", async () => {
  const ctx = context();
  const child = await run("createOwnedPage", ctx, pageArgs);
  const own = await run("saveLink", ctx, linkArgs("test-user"));
  const extra = await run("saveLink", ctx, linkArgs(child.userId));
  const subAccountId = ctx.db.rows("subAccounts")[0]._id;
  await assert.rejects(
    legacy.deleteSubAccount._handler(context(ctx.db, "other-user"), {
      subAccountId,
    }),
    /Acesso negado/,
  );
  assert.ok(await ctx.db.get(extra));
  await legacy.deleteSubAccount._handler(ctx, { subAccountId });
  assert.equal(await ctx.db.get(extra), null);
  assert.ok(await ctx.db.get(own));
  assert.equal(ctx.db.rows("subAccounts").length, 0);
  assert.equal(
    ctx.db.rows("usernames").filter((x) => x.userId === child.userId).length,
    0,
  );
});

test("public additional pages inherit their owner's paid subscription", async () => {
  const { getFunctionName } = require("convex/server");
  const calls = [];
  const subscriptions = bundle("lib/subscription.ts", {
    "convex/nextjs": {
      fetchQuery: async (ref, args) => {
        const name = getFunctionName(ref);
        calls.push(name);
        if (name === "users:getUserByUsername") return { userId: "sub_child" };
        if (name === "lib/subAccounts:getOwnerOfSubAccount")
          return { ownerUserId: "paid-owner" };
        throw new Error("Unexpected query " + name);
      },
    },
    "@clerk/nextjs/server": {
      currentUser: async () => ({
        id: "paid-owner",
        publicMetadata: { subscriptionPlan: "pro" },
      }),
    },
  });
  assert.equal(
    (await subscriptions.getUserSubscriptionPlanByUsername("minha-loja")).plan,
    "pro",
  );
  assert.equal(calls.length, 2);
});

test("legacy three-digit brand colors remain editable without changing their meaning", () => {
  const values = helper.appearanceValues({
    displayName: "Loja",
    accentColor: "#abc",
    backgroundColor1: "#fff",
    backgroundColor2: "#000",
  });
  assert.equal(values.accentColor, "#aabbcc");
  assert.equal(values.backgroundColor1, "#ffffff");
  assert.equal(helper.appearanceError(values), "");
});
