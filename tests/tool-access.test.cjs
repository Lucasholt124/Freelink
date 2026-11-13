const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const Module = require("node:module");
const esbuild = require("esbuild");
const root = path.resolve(__dirname, "..");
const Gate = () => null;
const PaidTool = () => null;
let user = { id: "test-user" };
let plan = "free";
const stubs = {
  "@clerk/nextjs/server": { currentUser: async () => user },
  "@/lib/subscription": { getUserSubscriptionPlan: async () => ({ plan }) },
  "@/components/tool-access/ToolAccessGate": {
    __esModule: true,
    default: Gate,
  },
  "@/components/AdsManager": { __esModule: true, default: PaidTool },
  "@/components/GiveawayTool": { __esModule: true, default: PaidTool },
  "@/components/ProfitCalculator": { __esModule: true, default: PaidTool },
  "@/components/TrackingForm": { TrackingForm: PaidTool },
};
function loadRoute(route) {
  const code = esbuild.buildSync({
    entryPoints: [path.join(root, `app/(admin)/dashboard/${route}/page.tsx`)],
    bundle: true,
    platform: "node",
    format: "cjs",
    packages: "external",
    write: false,
    jsx: "automatic",
    external: Object.keys(stubs),
  }).outputFiles[0].text;
  const filename = path.join(__dirname, `__gate-${route}.cjs`);
  const loaded = new Module(filename, module);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(__dirname);
  loaded.require = (request) => stubs[request] || module.require(request);
  loaded._compile(code, filename);
  return loaded.exports.default;
}
const routes = ["ads", "giveaway", "profit-calculator", "tracking"].map(
  loadRoute,
);
function containsPaidTool(node) {
  if (Array.isArray(node)) return node.some(containsPaidTool);
  return Boolean(
    node &&
    typeof node === "object" &&
    (node.type === PaidTool || containsPaidTool(node.props?.children)),
  );
}
test("all four tools show their gate for a free account", async () => {
  user = { id: "test-user" };
  plan = "free";
  const tools = ["ads", "giveaway", "finance", "tracking"];
  for (let i = 0; i < routes.length; i++) {
    const result = await routes[i]();
    assert.equal(result.type, Gate);
    assert.equal(result.props.tool, tools[i]);
    assert.equal(result.props.currentPlan, "free");
    assert.equal(containsPaidTool(result), false);
  }
});
test("Pro retains ads and giveaways, with Ultra gates for finance and tracking", async () => {
  user = { id: "test-user" };
  plan = "pro";
  for (let i = 0; i < routes.length; i++) {
    const result = await routes[i]();
    assert.equal(containsPaidTool(result), i < 2);
    if (i >= 2) {
      assert.equal(result.type, Gate);
      assert.equal(result.props.currentPlan, "pro");
    }
  }
});
test("Ultra retains access to every tool", async () => {
  user = { id: "test-user" };
  plan = "ultra";
  for (const route of routes)
    assert.equal(containsPaidTool(await route()), true);
});
test("existing administrator access is preserved", async () => {
  user = { id: "user_301NTkVsE3v48SXkoCEp0XOXifI" };
  plan = "free";
  for (const route of routes)
    assert.equal(containsPaidTool(await route()), true);
});
test("anonymous requests do not render protected tools", async () => {
  user = null;
  plan = "free";
  for (const route of routes) assert.equal(await route(), null);
});
