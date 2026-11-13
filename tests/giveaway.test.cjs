const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const Module = require("node:module");
const esbuild = require("esbuild");
const project = path.resolve(__dirname, "..");
const code = esbuild.buildSync({
  entryPoints: [path.join(project, "lib/giveaway.ts")],
  bundle: true,
  platform: "node",
  format: "cjs",
  packages: "external",
  write: false,
}).outputFiles[0].text;
const loaded = new Module(path.join(__dirname, "__giveaway.cjs"), module);
loaded.filename = path.join(__dirname, "__giveaway.cjs");
loaded.paths = Module._nodeModulePaths(__dirname);
loaded._compile(code, loaded.filename);
const helpers = loaded.exports;
const people = [
  {
    id: "1",
    name: "João Silva",
    identifier: "Instagram: @joao",
    timestamp: "2026-11-12T12:00:00Z",
  },
  {
    id: "2",
    name: "Marília Costa",
    identifier: "WhatsApp: (79) 99999-0000",
    timestamp: "2026-11-12T12:01:00Z",
  },
  {
    id: "3",
    name: "Ana Maria",
    identifier: "Instagram: @ana",
    timestamp: "2026-11-12T12:02:00Z",
  },
];
const giveaway = {
  id: "example",
  title: "Kit da loja",
  participants: people,
  isActive: false,
  createdAt: "2026-11-12T11:00:00Z",
};

test("unbiased draw rejects the incomplete range at the top of uint32", () => {
  const values = [4294967295, 5];
  assert.equal(
    helpers.randomParticipantIndex(3, () => values.shift()),
    2,
  );
  assert.equal(values.length, 0);
  assert.equal(
    helpers.randomParticipantIndex(2, () => 4294967295),
    1,
  );
  assert.equal(
    helpers.randomParticipantIndex(3, () => 0),
    0,
  );
});
test("draw requires at least two participants and a valid random source", () => {
  for (const count of [0, 1, -1, 1.5, Infinity])
    assert.throws(() => helpers.randomParticipantIndex(count, () => 0));
  for (const value of [-1, 4294967296, NaN, 0.5])
    assert.throws(() => helpers.randomParticipantIndex(2, () => value));
});
test("closed inscriptions remain eligible and the result freezes the selected participant", () => {
  const copy = structuredClone(giveaway);
  const result = helpers.drawGiveaway(copy, () => 1, "2026-11-12T13:00:00Z");
  assert.equal(result.winner.name, "Marília Costa");
  assert.equal(result.total, 3);
  copy.participants[1].name = "Changed later";
  copy.participants.push({ ...people[0], id: "4" });
  assert.equal(result.winner.name, "Marília Costa");
  assert.equal(result.total, 3);
});
test("result cache is scoped to user and giveaway and rejects corrupt or mismatched results", () => {
  const result = helpers.drawGiveaway(
    giveaway,
    () => 0,
    "2026-11-12T13:00:00Z",
  );
  assert.deepEqual(
    helpers.parseGiveawayResult(JSON.stringify(result), "example"),
    result,
  );
  assert.equal(
    helpers.parseGiveawayResult(JSON.stringify(result), "another"),
    null,
  );
  assert.equal(helpers.parseGiveawayResult("{bad", "example"), null);
  assert.equal(
    helpers.parseGiveawayResult(
      JSON.stringify({ ...result, drawnAt: "bad" }),
      "example",
    ),
    null,
  );
  assert.equal(
    helpers.parseGiveawayResult(
      JSON.stringify({ ...result, winner: { name: "missing fields" } }),
      "example",
    ),
    null,
  );
  assert.notEqual(
    helpers.resultStorageKey("user1", "example"),
    helpers.resultStorageKey("user2", "example"),
  );
  assert.notEqual(
    helpers.resultStorageKey("user1", "example"),
    helpers.resultStorageKey("user1", "another"),
  );
});
test("participant search accepts accents and combined name and contact terms", () => {
  assert.deepEqual(
    helpers.filterParticipants(people, "joao @joao").map((person) => person.id),
    ["1"],
  );
  assert.deepEqual(
    helpers
      .filterParticipants(people, "marilia whatsapp")
      .map((person) => person.id),
    ["2"],
  );
  assert.deepEqual(helpers.filterParticipants(people, "inexistente"), []);
  assert.equal(helpers.filterParticipants(people, "").length, 3);
});
test("history filters distinguish open inscriptions from closed ones", () => {
  const list = [giveaway, { ...giveaway, id: "open", isActive: true }];
  assert.deepEqual(
    helpers.filterGiveaways(list, "active").map((item) => item.id),
    ["open"],
  );
  assert.deepEqual(
    helpers.filterGiveaways(list, "closed").map((item) => item.id),
    ["example"],
  );
  assert.equal(helpers.filterGiveaways(list, "all").length, 2);
});
test("export contains the result and the actual participant count", () => {
  const result = helpers.drawGiveaway(
    giveaway,
    () => 0,
    "2026-11-12T13:00:00Z",
  );
  const text = helpers.giveawayResultText(result);
  for (const value of [
    result.title,
    result.winner.name,
    result.winner.identifier,
    "Participantes considerados: 3",
  ])
    assert.ok(text.includes(value));
  assert.equal(helpers.participantContact("Instagram: @joao"), "@joao");
  assert.equal(
    helpers.participantContact("WhatsApp: (79) 99999-0000"),
    "(79) 99999-0000",
  );
});
