const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const Module = require("node:module");
const esbuild = require("esbuild");
const { File } = require("node:buffer");
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
  const loaded = new Module(path.join(__dirname, "__ads.cjs"), module);
  loaded.filename = path.join(__dirname, "__ads.cjs");
  loaded.paths = Module._nodeModulePaths(__dirname);
  loaded.require = (request) => stubs[request] || module.require(request);
  loaded._compile(code, loaded.filename);
  return loaded.exports;
}
const ads = bundle("lib/ads.ts");
const month = "2026-11";
const campaign = {
  _id: "one",
  title: "Coleção Verão",
  productLink: "https://example.com/produto",
  adText: "Peças para conhecer",
  mediaUrls: [],
  niche: "vestuario",
  status: "active",
  views: 300,
  clicks: 24,
  maxViewsLimit: 1000,
  lastResetMonth: month,
  createdAt: 1794481200000,
};
test("monthly impressions and accumulated clicks retain different periods", () => {
  const old = {
    ...campaign,
    _id: "old",
    lastResetMonth: "2026-10",
    views: 1000,
    clicks: 70,
    status: "completed",
  };
  assert.deepEqual(ads.adTotals([campaign, old], month), {
    views: 300,
    clicks: 94,
    active: 1,
  });
  assert.equal(ads.adMonth(new Date("2026-11-01T00:00:00Z")), month);
});
test("completed campaigns can reactivate in a new month while current-month limits remain blocked", () => {
  assert.equal(
    ads.campaignState({ ...campaign, status: "completed", views: 1000 }, month),
    "limit",
  );
  assert.equal(
    ads.campaignState(
      {
        ...campaign,
        status: "completed",
        views: 1000,
        lastResetMonth: "2026-10",
      },
      month,
    ),
    "ready",
  );
  assert.equal(
    ads.campaignState({ ...campaign, status: "paused" }, month),
    "paused",
  );
});
test("consumption bars remain valid with exceeded or missing quotas", () => {
  assert.equal(ads.adProgress({ ...campaign, views: 2000 }, month), 100);
  assert.equal(ads.adProgress({ ...campaign, views: -5 }, month), 0);
  assert.equal(ads.adProgress({ ...campaign, maxViewsLimit: 0 }, month), 0);
});
test("search accepts accents, categories and a status filter together", () => {
  assert.deepEqual(
    ads.filterCampaigns([campaign], "colecao moda", "active", month),
    [campaign],
  );
  assert.deepEqual(
    ads.filterCampaigns([campaign], "colecao", "paused", month),
    [],
  );
});
test("campaign review requires complete content, media and a safe destination", () => {
  const draft = {
    title: " Coleção ",
    productLink: " https://example.com/produto ",
    adText: "Conheça nossa coleção.",
    niche: "vestuario",
  };
  assert.deepEqual(ads.validateAdDraft(draft, 1, 2), {});
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,test",
    "/produto",
    "www.example.com",
  ])
    assert.equal(ads.adDestination(url), null);
  assert.ok(
    ads.validateAdDraft({ ...draft, title: " ", adText: " " }, 0, 2).title,
  );
  assert.ok(ads.validateAdDraft(draft, 0, 2).media);
  assert.ok(ads.validateAdDraft(draft, 3, 2).media);
  assert.ok(ads.validateAdDraft({ ...draft, niche: "unknown" }, 1, 2).niche);
});
test("file validation checks format, empty files, image/video sizes and remaining slots", () => {
  const files = [
    { name: "bad.txt", type: "text/plain", size: 1 },
    { name: "empty.png", type: "image/png", size: 0 },
    { name: "large.png", type: "image/png", size: 11 * 1024 * 1024 },
    { name: "ok.png", type: "image/png", size: 500 },
    { name: "clip.mp4", type: "video/mp4", size: 51 * 1024 * 1024 },
    { name: "ok.webp", type: "image/webp", size: 500 },
  ];
  const result = ads.selectAdFiles(files, 1, 2);
  assert.deepEqual(result.accepted, [3]);
  assert.equal(result.errors.length, 5);
});
test("plan capacities preserve current campaign and media limits", () => {
  assert.deepEqual(ads.adPlanLimits.pro, {
    campaigns: 2,
    media: 2,
    viewsPerCampaign: 1000,
  });
  assert.deepEqual(ads.adPlanLimits.ultra, {
    campaigns: 3,
    media: 10,
    viewsPerCampaign: 5000,
  });
  const text = ads.suggestedAdText("Nova coleção");
  assert.ok(text.includes("Nova coleção"));
  assert.ok(!/desconto|estoque|poucas|imperdível/i.test(text));
});
function controller(create, upload) {
  const workspace = () => null;
  const api = {
    ads: {
      getCampaigns: "get",
      generateUploadUrl: "upload",
      publishCampaign: "create",
      toggleCampaignStatus: "toggle",
      deleteCampaign: "delete",
    },
  };
  const module = bundle("components/AdsManager.tsx", {
    react: { useRef: (value) => ({ current: value }) },
    "@clerk/nextjs": {
      useUser: () => ({ user: { id: "test" }, isLoaded: true }),
    },
    "convex/react": {
      useConvexAuth: () => ({ isAuthenticated: true, isLoading: false }),
      useQuery: () => [],
      useAction: (key) => key === "create" ? create : async () => {},
      useMutation: (key) =>
        key === "upload" ? upload : key === "create" ? create : async () => {},
    },
    "@/convex/_generated/api": { api },
    "@/components/ads/AdsWorkspace": { __esModule: true, default: workspace },
  });
  return module.default({ userPlan: "pro" }).props;
}
test("failed storage uploads never create a campaign", async () => {
  let created = 0;
  const props = controller(
    async () => {
      created++;
    },
    async () => "https://uploads.invalid/test",
  );
  const original = global.fetch;
  global.fetch = async () => ({ ok: false });
  try {
    await assert.rejects(
      props.onCreate(
        {
          title: "Teste",
          adText: "Mensagem",
          productLink: "https://example.com",
          niche: "vestuario",
          files: [new File(["a"], "one.png", { type: "image/png" })],
        },
        () => {},
      ),
      /Não foi possível enviar/,
    );
    assert.equal(created, 0);
  } finally {
    global.fetch = original;
  }
});
test("a storage response without a valid identifier never creates a campaign", async () => {
  let created = 0;
  const props = controller(
    async () => {
      created++;
    },
    async () => "https://uploads.invalid/test",
  );
  const original = global.fetch;
  try {
    for (const data of [null, {}, { storageId: "" }]) {
      global.fetch = async () => ({ ok: true, json: async () => data });
      await assert.rejects(
        props.onCreate(
          {
            title: "Teste",
            adText: "Mensagem",
            productLink: "https://example.com",
            niche: "vestuario",
            files: [new File(["a"], "one.png", { type: "image/png" })],
          },
          () => {},
        ),
        /não foi concluído/,
      );
    }
    assert.equal(created, 0);
  } finally {
    global.fetch = original;
  }
});
test("retry after publication failure reuses uploaded files and preserves media order", async () => {
  let uploads = 0,
    attempts = 0,
    payload;
  const props = controller(
    async (input) => {
      payload = input;
      if (++attempts === 1) throw Error("publish failed");
    },
    async () => `https://uploads.invalid/${++uploads}`,
  );
  const original = global.fetch;
  global.fetch = async (url) => ({
    ok: true,
    json: async () => ({ storageId: `storage-${url.split("/").pop()}` }),
  });
  const input = {
    title: " Teste ",
    adText: " Mensagem ",
    productLink: " https://example.com ",
    niche: "vestuario",
    files: [
      new File(["a"], "one.png", { type: "image/png" }),
      new File(["b"], "two.mp4", { type: "video/mp4" }),
    ],
  };
  const progress = [];
  try {
    await assert.rejects(
      props.onCreate(input, (value) => progress.push(value)),
    );
    await props.onCreate(input, (value) => progress.push(value));
    assert.equal(uploads, 2);
    assert.equal(attempts, 2);
    assert.deepEqual(payload.mediaStorageIds, ["storage-1", "storage-2"]);
    assert.deepEqual(payload.mediaTypes, ["image", "video"]);
    assert.equal(payload.title, "Teste");
    assert.equal(payload.productLink, "https://example.com/");
    assert.equal(progress.at(-1).phase, "saving");
  } finally {
    global.fetch = original;
  }
});
