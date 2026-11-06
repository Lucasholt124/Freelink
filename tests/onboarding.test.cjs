const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const Module = require("node:module");
const esbuild = require("esbuild");

// Exercise the real Convex handlers without network access or user data.
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
  const filename = path.join(project, "tests", "__onboarding-test-bundle.cjs");
  const loaded = new Module(filename, module);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  loaded._compile(output, filename);
  return loaded.exports;
}
const api = bundle("convex/onboarding.ts");
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
async function prepared(ctx) {
  await run("saveProfile", ctx, {
    displayName: "  Minha marca  ",
    bio: "  Minha bio  ",
  });
  await run("saveUsername", ctx, { username: "minha-marca" });
}

test("reserving an address never completes an active onboarding; reload restores the draft", async () => {
  const ctx = context();
  await prepared(ctx);
  const status = await run("getOnboardingStatus", ctx);
  assert.equal(status.completed, false);
  assert.equal(status.currentStep, 3);
  const draft = await run("getOnboardingData", ctx);
  assert.equal(draft.profile.displayName, "Minha marca");
  assert.equal(draft.profile.bio, "Minha bio");
  assert.equal(draft.username, "minha-marca");
  await run("ensureOnboardingComplete", ctx);
  await run("dismissWelcome", ctx);
  assert.equal((await run("getOnboardingStatus", ctx)).completed, false);
});

test("review stays open until explicit completion; retrying a link save does not duplicate it", async () => {
  const ctx = context();
  await prepared(ctx);
  await run("saveFirstLink", ctx, {
    title: "Meu site",
    url: "example.com/catalogo",
  });
  let draft = await run("getOnboardingData", ctx);
  assert.equal(draft.status.currentStep, 4);
  assert.equal(draft.status.completed, false);
  assert.equal(draft.firstLink.url, "https://example.com/catalogo");
  await run("saveFirstLink", ctx, {
    title: "Nosso site",
    url: "https://example.com/novo",
  });
  assert.equal(ctx.db.rows("links").length, 1);
  assert.equal(ctx.db.rows("links")[0].title, "Nosso site");
  await run("saveProfile", ctx, {
    displayName: "Nome revisado",
    bio: "Bio revisada",
  });
  draft = await run("getOnboardingData", ctx);
  assert.equal(draft.status.currentStep, 4);
  assert.equal(draft.profile.displayName, "Nome revisado");
  assert.equal(draft.status.completed, false);
  await run("completeOnboarding", ctx);
  await run("completeOnboarding", ctx);
  assert.equal((await run("getOnboardingStatus", ctx)).completed, true);
  assert.ok(
    ctx.db.rows("userOnboarding")[0].steps.every((step) => step.completed),
  );
});

test("a first link can be skipped without blocking completion or creating an empty link", async () => {
  const ctx = context();
  await prepared(ctx);
  await run("saveFirstLink", ctx, { skip: true });
  assert.equal(ctx.db.rows("links").length, 0);
  assert.equal((await run("getOnboardingStatus", ctx)).completed, false);
  await run("completeOnboarding", ctx);
  assert.equal((await run("getOnboardingStatus", ctx)).completed, true);
});

test("an already owned address is accepted while another account cannot reserve it", async () => {
  const ctx = context();
  await prepared(ctx);
  await run("saveUsername", ctx, { username: "minha-marca" });
  const other = context(ctx.db, "other-user");
  await run("saveProfile", other, { displayName: "Outro perfil", bio: "" });
  await assert.rejects(run("saveUsername", other, { username: "minha-marca" }));
  assert.equal((await run("getOnboardingStatus", other)).currentStep, 2);
  assert.equal(ctx.db.rows("usernames").length, 1);
});

test("invalid inputs and out-of-order completion are rejected before writes", async () => {
  const ctx = context();
  await assert.rejects(
    run("saveProfile", ctx, { displayName: "   ", bio: "" }),
  );
  assert.equal(ctx.db.rows("userCustomizations").length, 0);
  await assert.rejects(run("saveUsername", ctx, { username: "valid-name" }));
  await assert.rejects(run("completeOnboarding", ctx));
  await prepared(ctx);
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,test",
    "mailto:test@example.com",
    "https://",
    "not-a-domain",
  ]) {
    await assert.rejects(run("saveFirstLink", ctx, { title: "Meu link", url }));
  }
  assert.equal(ctx.db.rows("links").length, 0);
  assert.equal((await run("getOnboardingStatus", ctx)).currentStep, 3);
});

test("unauthenticated operations cannot save user data", async () => {
  const ctx = context(undefined, null);
  assert.equal(await run("getOnboardingData", ctx), null);
  await assert.rejects(
    run("saveProfile", ctx, { displayName: "Teste", bio: "" }),
  );
  await assert.rejects(run("saveUsername", ctx, { username: "teste" }));
  await assert.rejects(run("saveFirstLink", ctx, { skip: true }));
  await assert.rejects(run("completeOnboarding", ctx));
  assert.equal(ctx.db.rows("userOnboarding").length, 0);
});

test("existing legacy accounts still open the dashboard", async () => {
  const ctx = context();
  await ctx.db.insert("usernames", { userId: "test-user", username: "legado" });
  assert.equal((await run("getOnboardingStatus", ctx)).completed, true);
  await run("ensureOnboardingComplete", ctx);
  assert.equal(ctx.db.rows("userOnboarding")[0].completed, true);
});

test("photo removal persists and editing a previous step preserves progress", async () => {
  const ctx = context();
  await run("saveProfile", ctx, {
    displayName: "Teste",
    bio: "",
    photoUrl: "https://test.invalid/avatar.png",
  });
  await run("saveUsername", ctx, { username: "teste-foto" });
  await run("saveProfile", ctx, {
    displayName: "Teste",
    bio: "",
    removePhoto: true,
  });
  const draft = await run("getOnboardingData", ctx);
  assert.equal(draft.profile.photoUrl, null);
  assert.equal(draft.status.currentStep, 3);
});

test("client and server share the same URL and username rules", () => {
  assert.equal(
    normalizeLinkUrl(" example.com/ola "),
    "https://example.com/ola",
  );
  assert.equal(
    normalizeLinkUrl("http://localhost:5000"),
    "http://localhost:5000/",
  );
  assert.equal(normalizeLinkUrl("https://user:secret@example.com"), null);
  assert.equal(usernameError("minha-marca_1"), null);
  assert.ok(usernameError("nome.com"));
  assert.ok(usernameError("ab"));
});
