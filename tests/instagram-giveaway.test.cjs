const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  Module = require("node:module");
const esbuild = require("esbuild"),
  { JSDOM } = require("jsdom"),
  { createHash } = require("node:crypto");
const root = path.resolve(__dirname, "..");
function load(file) {
  const filename = path.join(root, file);
  let contents = fs.readFileSync(filename, "utf8");
  if (file.endsWith("background.js"))
    contents = contents.replace(
      /(['"])\.\/connector-core\.js\1/,
      JSON.stringify(
        path.join(root, "lib/instagram-giveaway.ts").replaceAll("\\", "/"),
      ),
    );
  const code = esbuild.buildSync({
    stdin: {
      contents,
      resolveDir: path.dirname(filename),
      loader: file.endsWith(".ts") ? "ts" : "js",
      sourcefile: file,
    },
    bundle: true,
    packages: "external",
    platform: "node",
    format: "cjs",
    write: false,
  }).outputFiles[0].text;
  const module = new Module(path.join(__dirname, "__instagram.cjs"));
  module.paths = Module._nodeModulePaths(__dirname);
  module._compile(
    code,
    (module.filename = path.join(__dirname, "__instagram.cjs")),
  );
  return module.exports;
}
const helpers = load("lib/instagram-giveaway.ts");
const extractor = load("extensions/instagram-reader/extractor.js");
const comment = (id, username, text = "Quero participar! @amiga") => ({
  id,
  username,
  text,
  capturedAt: "2026-11-13T12:00:00Z",
});
const rules = {
  uniqueUsers: true,
  keyword: "",
  mentions: 0,
  excludedUsers: "",
};
test("only supported Instagram post, Reel and live URLs are accepted and tracking parameters are removed", () => {
  assert.equal(
    helpers.instagramSource(
      "https://instagram.com/p/ABC123_def/?igsh=track",
      "post",
    ),
    "https://www.instagram.com/p/ABC123_def/",
  );
  assert.equal(
    helpers.instagramSource("https://www.instagram.com/loja/p/ABC123/", "post"),
    "https://www.instagram.com/p/ABC123/",
  );
  assert.equal(
    helpers.instagramSource(
      "https://www.instagram.com/loja/live/?broadcast_id=123456",
      "live",
    ),
    "https://www.instagram.com/loja/live/?broadcast_id=123456",
  );
  assert.equal(
    helpers.instagramSource(
      "https://www.instagram.com/loja/live/123456/",
      "live",
    ),
    "https://www.instagram.com/loja/live/?broadcast_id=123456",
  );
  for (const url of [
    "https://instagram.com.evil.test/p/ABC123/",
    "javascript:alert(1)",
    "https://user:password@www.instagram.com/p/ABC123/",
    "http://www.instagram.com/p/ABC123/",
    "https://www.instagram.com:444/p/ABC123/",
    "https://www.instagram.com/direct/inbox/",
    "https://www.instagram.com/loja/",
  ])
    assert.equal(helpers.instagramSource(url, "post"), null);
  assert.equal(
    helpers.instagramSource("https://www.instagram.com/p/ABC123/", "live"),
    null,
  );
});
test("comment batches validate data, replay safely, preserve earlier comments and enforce the cap", () => {
  const original = [comment("1", "ana")];
  const result = helpers.mergeCommentBatch(original, [
    comment("1", "ana"),
    comment("2", "BIA"),
    { ...comment("3", "bad/user") },
    { ...comment("4", "user"), capturedAt: "yesterday" },
  ]);
  assert.equal(result.added, 1);
  assert.equal(result.rejected, 2);
  assert.equal(result.comments[1].username, "bia");
  assert.equal(original.length, 1);
  const full = Array.from({ length: 5000 }, (_, i) =>
    comment(String(i), "user" + i),
  );
  assert.equal(
    helpers.mergeCommentBatch(full, [comment("extra", "ana")]).comments.length,
    5000,
  );
});
test("filters require distinct mentioned users, ignore self mentions and retain the first eligible comment per person", () => {
  const comments = [
    comment("1", "ana", "não"),
    comment("2", "ana", "PARTICIPAÇÃO @bia @bia"),
    comment("3", "ana", "participação @bia @maria"),
    comment("4", "bia", "participação @ana @maria"),
    comment("5", "cai", "participação @cai @bia"),
  ];
  assert.deepEqual(
    helpers
      .commentEntries(comments, {
        ...rules,
        keyword: "participacao",
        mentions: 2,
        excludedUsers: "@BIA",
      })
      .map((row) => row.id),
    ["3"],
  );
  assert.equal(
    helpers.commentEntries(comments, { ...rules, uniqueUsers: false }).length,
    5,
  );
  assert.equal(
    helpers
      .commentEntries(comments, rules, ["ANA"])
      .some((row) => row.username === "ana"),
    false,
  );
});
test("random selection rejects biased uint32 tail and invalid input", () => {
  const values = [4294967295, 5];
  assert.equal(
    helpers.uniformIndex(3, () => values.shift()),
    2,
  );
  assert.equal(values.length, 0);
  assert.throws(() => helpers.uniformIndex(1, () => 0), /duas/);
  assert.throws(() => helpers.uniformIndex(2, () => -1), /resultado/);
});
test("a draw locks a snapshot of entries and rules, excludes former winners and produces its digest before returning", async () => {
  const session = {
    id: "session-1",
    title: "Live",
    url: "https://www.instagram.com/loja/live/",
    mode: "live",
    createdAt: "2026-11-13T12:00:00Z",
    comments: [comment("1", "ana"), comment("2", "bia"), comment("3", "cai")],
    draws: [],
  };
  const digest = async (text) =>
    createHash("sha256").update(text).digest("hex");
  await assert.rejects(
    helpers.drawInstagramSession(
      session,
      rules,
      () => 0,
      "draw-1",
      "2026-11-13T12:05:00Z",
      digest,
    ),
    /Encerre/,
  );
  session.closedAt = "2026-11-13T12:04:00Z";
  const result = await helpers.drawInstagramSession(
    session,
    rules,
    () => 0,
    "draw-1",
    "2026-11-13T12:05:00Z",
    digest,
  );
  assert.equal(result.winner.username, "ana");
  assert.equal(result.digest.length, 64);
  assert.equal(result.eligibleCount, 3);
  session.comments[0].text = "alterado";
  assert.notEqual(result.entries[0].text, "alterado");
  session.draws.push(result);
  const second = await helpers.drawInstagramSession(
    session,
    rules,
    () => 0,
    "draw-2",
    "2026-11-13T12:06:00Z",
    digest,
  );
  assert.equal(second.winner.username, "bia");
  assert.equal(second.eligibleCount, 2);
  const exported = JSON.parse(helpers.exportInstagramAudit(session));
  assert.match(exported.collection, /parcial/);
  assert.equal(exported.session.draws[0].digest, result.digest);
});
test("CSV export prevents spreadsheet formulas and preserves quotes and lines", () => {
  const csv = helpers.commentCsv([
    comment("1", "ana", '=HYPERLINK("https://evil.test")\nsegunda linha'),
  ]);
  assert.ok(csv.startsWith("\ufeff"));
  assert.ok(csv.includes('"\'@ana"'));
  assert.ok(
    csv.includes('"\'=HYPERLINK(""https://evil.test"")\nsegunda linha"'),
  );
});
function documentFor(html) {
  return new JSDOM(`<main>${html}</main>`, {
    url: "https://www.instagram.com/p/ABC123/",
  }).window.document;
}
test("post extraction separates authors and tagged friends, ignores navigation and unknown layouts", () => {
  const doc = documentFor(
    `<nav><li><h3><a href="/fake/">fake</a></h3><span dir="auto">menu</span></li></nav><ul><li><h3><a href="/ana/">ana</a></h3><span dir="auto">Quero muito! <a href="/bia/">@bia</a></span><a href="/p/ABC123/c/123456/"><time datetime="2026-11-13T12:00:00Z">agora</time></a><button><span dir="auto">Responder</span></button></li><li><h1>Legenda</h1><a href="/loja/">loja</a><span dir="auto">Texto da publicação</span></li><li><a href="/desconhecido/">desconhecido</a><span dir="auto">Sem estrutura de comentário</span></li></ul>`,
  );
  const rows = extractor.extractComments(
    doc.querySelector("main"),
    "post",
    "2026-11-13T12:01:00Z",
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0].username, "ana");
  assert.equal(rows[0].text, "Quero muito! @bia");
  assert.equal(rows[0].id, "ig:123456");
});
test("live extraction supports a calibrated container and deduplicates identical text without a native id", () => {
  const doc = documentFor(
    `<div id="chat"><div><a href="/ana/">ana</a><span dir="auto">Participando</span></div><div><a href="/bia/">bia</a><span dir="auto">Eu também</span></div><div><a href="/ana/">ana</a><span dir="auto">Participando</span></div></div>`,
  );
  const rows = extractor.extractComments(
    doc.querySelector("#chat"),
    "live",
    "2026-11-13T12:01:00Z",
  );
  assert.equal(rows.length, 2);
  assert.equal(
    extractor.extractComments(doc.querySelector("#chat"), "post").length,
    0,
  );
  assert.equal(
    extractor.extractComment(doc.querySelector("#chat"), "live"),
    null,
  );
});
function chromeFixture() {
  let state = {},
    listener,
    updated;
  const sent = [],
    opened = [];
  const chrome = {
    storage: {
      session: {
        get: async () => structuredClone(state),
        set: async (value) => {
          state = structuredClone(value);
        },
      },
    },
    runtime: { onMessage: { addListener: (fn) => (listener = fn) } },
    tabs: {
      create: async (args) => {
        opened.push(args);
        return { id: 99 };
      },
      update: async () => {},
      sendMessage: async (_id, msg) => {
        sent.push(msg);
        return { ok: true };
      },
      onUpdated: { addListener: (fn) => (updated = fn) },
      onRemoved: { addListener: () => {} },
    },
    action: { onClicked: { addListener: () => {} } },
  };
  return {
    chrome,
    opened,
    sent,
    get: () => state,
    send: (message, sender) =>
      new Promise((resolve) => listener(message, sender, resolve)),
    updated,
  };
}
test("extension only accepts the giveaway workspace and returns batches until durable acknowledgement", async () => {
  const original = global.chrome;
  const fixture = chromeFixture();
  global.chrome = fixture.chrome;
  try {
    load("extensions/instagram-reader/background.js");
    const sender = {
      url: "https://www.freelinnk.com/dashboard/giveaway",
      tab: { id: 7 },
    };
    const start = {
      kind: "WORKSPACE",
      action: "START",
      mode: "post",
      url: "https://www.instagram.com/p/ABC123/",
      sessionId: "session-1234567890",
    };
    assert.equal(
      (await fixture.send(start, { url: "https://evil.test", tab: { id: 1 } }))
        .ok,
      false,
    );
    assert.equal(fixture.opened.length, 0);
    assert.equal((await fixture.send(start, sender)).ok, true);
    const source = {
      url: "https://www.instagram.com/p/ABC123/",
      tab: { id: 99 },
    };
    assert.equal(
      (
        await fixture.send(
          {
            kind: "COLLECTOR_BATCH",
            sessionId: start.sessionId,
            comments: [comment("1", "ana")],
            status: "collecting",
          },
          source,
        )
      ).ok,
      true,
    );
    const poll = {
      kind: "WORKSPACE",
      action: "POLL",
      sessionId: start.sessionId,
    };
    const first = await fixture.send(poll, sender);
    assert.equal(first.batch.comments.length, 1);
    assert.deepEqual((await fixture.send(poll, sender)).batch, first.batch);
    await fixture.send(
      { kind: "WORKSPACE", action: "ACK", sessionId: start.sessionId, seq: 99 },
      sender,
    );
    assert.ok((await fixture.send(poll, sender)).batch);
    await fixture.send(
      {
        kind: "WORKSPACE",
        action: "ACK",
        sessionId: start.sessionId,
        seq: first.batch.seq,
      },
      sender,
    );
    assert.equal((await fixture.send(poll, sender)).batch, null);
    await fixture.send(
      { kind: "WORKSPACE", action: "STOP", sessionId: start.sessionId },
      sender,
    );
    assert.equal(
      (
        await fixture.send(
          {
            kind: "COLLECTOR_BATCH",
            sessionId: start.sessionId,
            comments: [comment("2", "bia")],
          },
          source,
        )
      ).ok,
      false,
    );
    assert.equal(
      (await fixture.send(poll, { url: sender.url, tab: { id: 8 } })).status,
      "disconnected",
    );
  } finally {
    global.chrome = original;
  }
});
test("extension has no cookie or debugger access and ships no remote code", () => {
  const manifest = JSON.parse(
    fs
      .readFileSync(
        path.join(root, "extensions/instagram-reader/manifest.json"),
        "utf8",
      )
      .replace(/^\uFEFF/, ""),
  );
  assert.deepEqual(manifest.permissions, ["storage"]);
  assert.equal(manifest.manifest_version, 3);
  for (const name of ["background.js", "collector-entry.js", "bridge.js"]) {
    const source = fs.readFileSync(
      path.join(root, "extensions/instagram-reader", name),
      "utf8",
    );
    assert.ok(
      !/eval\(|document\.cookie|chrome\.cookies|graph\.facebook|api\.apify|access_token/.test(
        source,
      ),
    );
  }
});

test("mentions separated by punctuation count separately and live join notices are not comments", () => {
  const entries = helpers.commentEntries(
    [comment("a", "ana", "Quero! @bia,@cai")],
    { ...rules, mentions: 2 },
  );
  assert.equal(entries.length, 1);
  const doc = documentFor(
    '<div id="chat"><div><a href="/ana/">ana</a><span dir="auto">entrou na live</span></div><div><a href="/bia/">bia</a><span dir="auto">Quero participar</span></div></div>',
  );
  assert.deepEqual(
    extractor
      .extractComments(doc.querySelector("#chat"), "live")
      .map((row) => row.username),
    ["bia"],
  );
});
