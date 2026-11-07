const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const Module = require("node:module");
const esbuild = require("esbuild");
const project = path.resolve(__dirname, "..");
const filename = path.join(__dirname, "__dashboard-state-test.cjs");
const loaded = new Module(filename, module);
loaded.filename = filename;
loaded.paths = Module._nodeModulePaths(__dirname);
loaded._compile(
  esbuild.buildSync({
    entryPoints: [path.join(project, "lib/dashboard-load-state.ts")],
    bundle: true,
    platform: "node",
    format: "cjs",
    write: false,
  }).outputFiles[0].text,
  filename,
);
const { resolveDashboardLoadState: resolve } = loaded.exports;
const ready = {
  clerkLoaded: true,
  clerkSignedIn: true,
  convexLoading: false,
  convexAuthenticated: true,
  overview: "ready",
  timedOut: false,
};

test("a signed-in Clerk account with a rejected Convex session gets an actionable error", () => {
  assert.equal(
    resolve({ ...ready, convexAuthenticated: false, overview: "pending" }),
    "auth-error",
  );
  assert.equal(resolve({ ...ready, overview: "empty" }), "auth-error");
});
test("initial authentication and pending queries are loading only until the timeout", () => {
  for (const input of [
    { ...ready, clerkLoaded: false },
    { ...ready, convexLoading: true },
    { ...ready, overview: "pending" },
  ]) {
    assert.equal(resolve(input), "loading");
    assert.equal(resolve({ ...input, timedOut: true }), "timeout");
  }
});
test("a response arriving after timeout recovers without leaving the user on the error screen", () => {
  assert.equal(resolve({ ...ready, timedOut: true }), "ready");
});
test("a signed-out user cannot see a stale overview or an endless loading screen", () => {
  assert.equal(resolve({ ...ready, clerkSignedIn: false }), "signed-out");
  assert.equal(
    resolve({ ...ready, clerkSignedIn: false, overview: "pending" }),
    "signed-out",
  );
});
