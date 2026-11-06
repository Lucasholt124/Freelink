const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const Module = require("node:module");
const esbuild = require("esbuild");
const project = path.resolve(__dirname, "..");
function bundle(relative) {
  const output = esbuild.buildSync({
    entryPoints: [path.join(project, relative)],
    bundle: true,
    platform: "node",
    format: "cjs",
    packages: "external",
    write: false,
  }).outputFiles[0].text;
  const filename = path.join(project, "tests", "__dashboard-test-bundle.cjs");
  const loaded = new Module(filename, module);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  loaded._compile(output, filename);
  return loaded.exports;
}
const nav = bundle("lib/dashboard-navigation.ts");
const { getOverview } = bundle("convex/dashboard.ts");
function context(tables = {}, userId = "owner") {
  return {
    auth: {
      getUserIdentity: async () => (userId ? { subject: userId } : null),
    },
    storage: { getUrl: async (id) => `https://storage.example/${id}` },
    db: {
      query(table) {
        let records = [...(tables[table] || [])];
        return {
          withIndex(name, callback) {
            const filter = {
              eq(key, value) {
                records = records.filter((record) => record[key] === value);
                return filter;
              },
            };
            callback(filter);
            return this;
          },
          order(direction) {
            records.sort(
              (a, b) => (a.order - b.order) * (direction === "desc" ? -1 : 1),
            );
            return this;
          },
          unique: async () => {
            assert.ok(records.length <= 1);
            return records[0] || null;
          },
          first: async () => records[0] || null,
          collect: async () => records,
        };
      },
    },
  };
}
test("navigation selects the specific route and does not mark the overview on every page", () => {
  assert.equal(nav.activeDashboardHref("/dashboard/links"), "/dashboard/links");
  assert.equal(
    nav.activeDashboardHref("/dashboard/links/edit/123"),
    "/dashboard/links",
  );
  assert.equal(
    nav.activeDashboardHref("/dashboard/new-link"),
    "/dashboard/links",
  );
  assert.equal(nav.dashboardTitle("/dashboard/new-link"), "Novo link");
  assert.equal(nav.dashboardTitle("/dashboard/settings"), "Aparência e perfil");
  assert.equal(nav.activeDashboardHref("/dashboard/links-other"), undefined);
  assert.equal(nav.activeDashboardHref("/dashboard"), "/dashboard");
});
test("search finds real routes with accents and multiple terms, with an empty result when appropriate", () => {
  assert.equal(nav.searchDashboard("aparencia")[0].href, "/dashboard/settings");
  assert.equal(
    nav.searchDashboard("  receita custos  ")[0].href,
    "/dashboard/profit-calculator",
  );
  assert.equal(nav.searchDashboard("ANÚNCIOS")[0].href, "/dashboard/ads");
  assert.deepEqual(nav.searchDashboard("xyzmissing"), []);
  assert.equal(nav.searchDashboard("").length, nav.dashboardNavigation.length);
});
test("plan labels retain the existing Pro and Ultra feature boundaries", () => {
  assert.equal(nav.hasPlan("free", "pro"), false);
  assert.equal(nav.hasPlan("pro", "ultra"), false);
  assert.equal(nav.hasPlan("ultra", "pro"), true);
  assert.equal(nav.normalizePlan("unexpected"), "free");
  assert.equal(
    nav.dashboardNavigation.find((item) => item.href === "/dashboard/tracking")
      .plan,
    "ultra",
  );
});
test("anonymous overview does not read account data", async () => {
  const ctx = context({}, null);
  ctx.db.query = () => {
    throw new Error("Must not read private tables");
  };
  assert.equal(await getOverview._handler(ctx, {}), null);
});
test("empty account has honest zero counts and no completed setup steps", async () => {
  const result = await getOverview._handler(context(), {});
  assert.equal(result.linkCount, 0);
  assert.equal(result.featuredCount, 0);
  assert.equal(result.activeCampaignCount, 0);
  assert.equal(result.trackingCount, 0);
  assert.deepEqual(result.links, []);
  assert.deepEqual(result.setup, {
    profile: false,
    firstLink: false,
    appearance: false,
  });
});
test("overview isolates the owner, retains page order and counts actual saved records", async () => {
  const links = Array.from({ length: 6 }, (_, index) => ({
    _id: `l${index}`,
    userId: "owner",
    order: 5 - index,
    title: `Link ${index}`,
    url: "https://example.com",
    isFeatured: index < 2,
  }));
  const result = await getOverview._handler(
    context({
      usernames: [
        { userId: "other", username: "someone-else" },
        { userId: "owner", username: "my-page" },
      ],
      userCustomizations: [
        {
          userId: "owner",
          displayName: " Saved Name ",
          description: " About me ",
          profilePictureStorageId: "avatar",
          accentColor: "#7042dc",
        },
        { userId: "other", displayName: "Private" },
      ],
      links: [
        ...links,
        { _id: "foreign", userId: "other", order: -1, isFeatured: true },
      ],
      adCampaigns: [
        { userId: "owner", status: "active" },
        { userId: "owner", status: "paused" },
        { userId: "owner", status: "completed" },
        { userId: "other", status: "active" },
      ],
      tracking: [
        { userId: "owner", facebookPixelId: "123", googleAnalyticsId: "  " },
        { userId: "other", googleAnalyticsId: "G-OTHER" },
      ],
    }),
    {},
  );
  assert.equal(result.displayName, "Saved Name");
  assert.equal(result.username, "my-page");
  assert.equal(result.avatar, "https://storage.example/avatar");
  assert.equal(result.linkCount, 6);
  assert.equal(result.featuredCount, 2);
  assert.deepEqual(
    result.links.map((link) => link.id),
    ["l5", "l4", "l3", "l2"],
  );
  assert.equal(result.campaignCount, 3);
  assert.equal(result.activeCampaignCount, 1);
  assert.equal(result.trackingCount, 1);
  assert.deepEqual(result.setup, {
    profile: true,
    firstLink: true,
    appearance: true,
  });
});
test("blank profile values do not complete the presentation task", async () => {
  const result = await getOverview._handler(
    context({
      userCustomizations: [
        { userId: "owner", displayName: " ", description: " " },
      ],
    }),
    {},
  );
  assert.equal(result.displayName, null);
  assert.equal(result.setup.profile, false);
});
