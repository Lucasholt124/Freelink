const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const Module = require("node:module");
const esbuild = require("esbuild");
const root = path.resolve(__dirname, "..");
function bundle(file, stubs = {}) {
  const code = esbuild.buildSync({
    entryPoints: [path.join(root, file)],
    bundle: true,
    platform: "node",
    format: "cjs",
    packages: "external",
    external: Object.keys(stubs),
    write: false,
    jsx: "automatic",
  }).outputFiles[0].text;
  const loaded = new Module(path.join(__dirname, "__tracking.cjs"), module);
  loaded.filename = path.join(__dirname, "__tracking.cjs");
  loaded.paths = Module._nodeModulePaths(__dirname);
  loaded.require = (request) => stubs[request] || module.require(request);
  loaded._compile(code, loaded.filename);
  return loaded.exports;
}
const helpers = bundle("lib/tracking.ts");
const empty = { facebookPixelId: "", googleAnalyticsId: "" };
const saved = {
  facebookPixelId: "123456789012345",
  googleAnalyticsId: "G-ABC1234567",
};
test("normalization preserves numeric identifiers and accepts lowercase GA4 input", () => {
  assert.deepEqual(
    helpers.trackingValues({
      facebookPixelId: " 123456789012345 ",
      googleAnalyticsId: " g-abc1234567 ",
    }),
    saved,
  );
  assert.deepEqual(helpers.trackingValues(null), empty);
  assert.equal(
    helpers.trackingValues({ facebookPixelId: "123 456" }).facebookPixelId,
    "123 456",
  );
});
test("either integration is optional and pasted scripts or unrelated Google IDs are rejected", () => {
  for (const value of [
    empty,
    saved,
    { ...empty, facebookPixelId: saved.facebookPixelId },
    { ...empty, googleAnalyticsId: saved.googleAnalyticsId },
  ])
    assert.deepEqual(helpers.trackingErrors(value), {});
  assert.ok(
    helpers.trackingErrors({
      ...empty,
      facebookPixelId: "<script>123</script>",
    }).facebookPixelId,
  );
  assert.ok(
    helpers.trackingErrors({ ...empty, facebookPixelId: "123 456" })
      .facebookPixelId,
  );
  for (const id of [
    "GTM-ABC123",
    "AW-12345678",
    "UA-12345678-1",
    "<script>gtag()</script>",
    "G-A",
  ])
    assert.ok(
      helpers.trackingErrors({ ...empty, googleAnalyticsId: id })
        .googleAnalyticsId,
    );
});
test("save targets an explicitly owned page and clears removed identifiers", () => {
  const pages = [{ id: "main" }, { id: "brand" }];
  assert.deepEqual(helpers.trackingPayload(pages, "brand", saved), {
    userId: "brand",
    ...saved,
  });
  assert.deepEqual(helpers.trackingPayload(pages, "brand", empty), {
    userId: "brand",
    facebookPixelId: undefined,
    googleAnalyticsId: undefined,
  });
  assert.throws(
    () => helpers.trackingPayload(pages, "not-owned", saved),
    /sua conta/,
  );
  assert.throws(
    () =>
      helpers.trackingPayload(pages, "main", {
        ...saved,
        googleAnalyticsId: "bad",
      }),
    /Revise/,
  );
});
test("normalized-only edits do not require another save", () => {
  assert.equal(
    helpers.trackingChanged({
      base: saved,
      values: { ...saved, googleAnalyticsId: " g-abc1234567 " },
    }),
    false,
  );
  assert.equal(
    helpers.trackingChanged({
      base: saved,
      values: { ...saved, facebookPixelId: "123456789012346" },
    }),
    true,
  );
});
test("removal confirmation applies only to integrations that were previously saved", () => {
  assert.deepEqual(
    helpers.removedTracking(saved, { ...saved, facebookPixelId: "" }),
    ["facebookPixelId"],
  );
  assert.deepEqual(helpers.removedTracking(saved, empty), [
    "facebookPixelId",
    "googleAnalyticsId",
  ]);
  assert.deepEqual(helpers.removedTracking(empty, empty), []);
  assert.deepEqual(
    helpers.removedTracking(saved, {
      ...saved,
      facebookPixelId: "999999999999999",
    }),
    [],
  );
});
test("server refresh does not replace unsaved page-specific edits", () => {
  const draft = {
    base: saved,
    values: { ...saved, googleAnalyticsId: "G-NEW1234567" },
  };
  assert.equal(helpers.syncTrackingDraft(draft, saved), draft);
  const incoming = { ...saved, facebookPixelId: "999999999999999" };
  const merged = helpers.syncTrackingDraft(draft, incoming);
  assert.deepEqual(merged.values, draft.values);
  assert.deepEqual(merged.remote, incoming);
  assert.deepEqual(
    helpers.syncTrackingDraft({ base: saved, values: saved }, incoming),
    { base: incoming, values: incoming },
  );
  assert.deepEqual(helpers.syncTrackingDraft(draft, draft.values), {
    base: draft.values,
    values: draft.values,
  });
});
test("field states distinguish saved, unsaved, removed and invalid values without claiming live events", () => {
  assert.equal(
    helpers.trackingFieldStatus(
      { base: saved, values: saved },
      "facebookPixelId",
    ),
    "saved",
  );
  assert.equal(
    helpers.trackingFieldStatus(
      { base: empty, values: saved },
      "facebookPixelId",
    ),
    "pending",
  );
  assert.equal(
    helpers.trackingFieldStatus(
      { base: saved, values: empty },
      "facebookPixelId",
    ),
    "remove",
  );
  assert.equal(
    helpers.trackingFieldStatus(
      { base: empty, values: empty },
      "facebookPixelId",
    ),
    "empty",
  );
  assert.equal(
    helpers.trackingFieldStatus(
      { base: empty, values: { ...empty, googleAnalyticsId: "UA-123" } },
      "googleAnalyticsId",
    ),
    "invalid",
  );
});
function controller(save, settings, status = "ready") {
  const queries = [];
  const workspace = () => null;
  const pages = [
    {
      userId: "main",
      displayName: "Principal",
      username: "principal",
      isMain: true,
      accentColor: "#7042dc",
    },
    {
      userId: "brand",
      displayName: "Marca",
      username: "marca",
      isMain: false,
      accentColor: "#557765",
    },
  ];
  const module = bundle("components/TrackingForm.tsx", {
    react: { useState: (value) => [value, () => {}], useEffect: () => {} },
    "convex/react": {
      useQuery: (_query, args) => {
        queries.push(args);
        return settings;
      },
      useMutation: () => save,
    },
    "@/convex/_generated/api": {
      api: { tracking: { getMyTrackingIds: "get", saveTrackingIds: "save" } },
    },
    "@/components/page-editor/WorkspaceProvider": {
      usePageWorkspace: () => ({
        pages,
        selected: pages[1],
        selectPage: () => {},
        status,
      }),
      WorkspaceBoundary: () => null,
    },
    "@/components/tracking/TrackingWorkspace": {
      __esModule: true,
      default: workspace,
    },
  });
  return { props: module.TrackingController().props, queries };
}
test("controller reads the selected workspace page and forwards its own target on save", async () => {
  let payload;
  const { props, queries } = controller(async (value) => {
    payload = value;
  });
  assert.deepEqual(queries, [{ userId: "brand" }]);
  await props.onSave("main", saved);
  assert.deepEqual(payload, { userId: "main", ...saved });
  await assert.rejects(props.onSave("unknown", saved), /sua conta/);
});
test("save completion awaits the server and propagates failure to the form", async () => {
  let reject;
  const pending = new Promise((_resolve, rejectPromise) => {
    reject = rejectPromise;
  });
  const { props } = controller(() => pending);
  let settled = false;
  const saving = props.onSave("brand", saved).finally(() => {
    settled = true;
  });
  await Promise.resolve();
  assert.equal(settled, false);
  reject(new Error("save failed"));
  await assert.rejects(saving, /save failed/);
  assert.equal(settled, true);
});
test("unresolved settings remain loading while an empty saved configuration is ready", () => {
  assert.equal(controller(async () => {}, undefined).props.loading, true);
  assert.equal(controller(async () => {}, null).props.loading, false);
  assert.deepEqual(controller(async () => {}, null, "invalid").queries, [
    "skip",
  ]);
});
