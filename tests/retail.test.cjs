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
const helpers = load("lib/retail.ts");
test("option chips preserve decimal commas and restore earlier drafts", () => {
  assert.deepEqual(helpers.readOptionValues('["0,5 L","1 L"]'), [
    "0,5 L",
    "1 L",
  ]);
  assert.deepEqual(helpers.readOptionValues("Azul, Verde"), ["Azul", "Verde"]);
  assert.deepEqual(helpers.readOptionValues(""), []);
});
const retail = load("convex/retail.ts");
const financial = load("convex/profitCalculator.ts");
const product = (id = "products:a", extra = {}) => ({
  _id: id,
  _creationTime: 1,
  userId: "seller",
  name: "Caderno",
  active: true,
  costPrice: 10,
  salePrice: 25,
  stock: 10,
  unit: "un",
  createdAt: 1,
  ...extra,
});
const capture = (extra = {}) => ({
  requestId: "capture-request-0001",
  name: "Produto de exemplo",
  costPrice: 10,
  salePrice: 25,
  unit: "un",
  variants: [{ options: [], stock: 4 }],
  ...extra,
});
const sale = (extra = {}) => ({
  requestId: "sale-request-000001",
  items: [
    {
      productId: "products:a",
      productName: "Nome do cliente é ignorado",
      quantity: 2,
      costPrice: 10,
      salePrice: 25,
    },
  ],
  date: "2026-11-13",
  paymentMethod: "pix",
  paymentStatus: "paid",
  ...extra,
});
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
test("Brazilian decimal inputs, measured quantities and calendar dates are validated", () => {
  assert.equal(helpers.parseRetailNumber("R$ 1.234,56"), 1234.56);
  assert.equal(helpers.parseRetailNumber("0,500"), 0.5);
  assert.ok(Number.isNaN(helpers.parseRetailNumber("")));
  assert.ok(Number.isNaN(helpers.parseRetailNumber("abc")));
  assert.equal(helpers.validQuantity(0.5, "kg"), true);
  assert.equal(helpers.validQuantity(0.5, "un"), false);
  assert.equal(helpers.validQuantity(0.0001, "m"), false);
  assert.equal(helpers.validateSaleDate("2026-02-30"), false);
  assert.equal(helpers.validateSaleDate("2026-99-99"), false);
  assert.equal(helpers.validateSaleDate("2024-02-29"), true);
});
test("option combinations work for colors, volumes, models and sizes without duplicates", () => {
  const rows = helpers.expandOptions([
    { name: "Volume", values: ["100 ml", "200 ml", "100 ml"] },
    { name: "Fragrância", values: ["Lavanda", "Cítrica"] },
  ]);
  assert.equal(rows.length, 4);
  assert.equal(helpers.optionLabel(rows[3]), "200 ml · Cítrica");
  assert.throws(
    () =>
      helpers.expandOptions([
        {
          name: "Modelo",
          values: Array.from({ length: 21 }, (_, i) => String(i)),
        },
      ]),
    /60/,
  );
  assert.deepEqual(helpers.expandOptions([]), [[]]);
});
test("capture rejects duplicate options or codes, invalid units and invalid money but accepts zero cost", () => {
  assert.deepEqual(helpers.validateCapture(capture({ costPrice: 0 })), []);
  assert.ok(
    helpers.validateCapture(
      capture({
        variants: [
          { options: [], stock: 1 },
          { options: [], stock: 2 },
        ],
      }),
    ).length,
  );
  assert.ok(
    helpers.validateCapture(
      capture({ unit: "un", variants: [{ options: [], stock: 0.5 }] }),
    ).length,
  );
  assert.ok(helpers.validateCapture(capture({ costPrice: 1.001 })).length);
  assert.ok(
    helpers.validateCapture(
      capture({
        variants: [{ options: [], stock: 1, barcode: "flnk:product:other" }],
      }),
    ).length,
  );
  assert.ok(
    helpers.validateCapture(
      capture({
        variants: [
          {
            options: [{ name: "Cor", value: "Azul" }],
            stock: 1,
            barcode: "001",
          },
          {
            options: [{ name: "Cor", value: "Verde" }],
            stock: 1,
            barcode: "001",
          },
        ],
      }),
    ).length,
  );
});
test("scanner resolves own QR codes, old SKUs and supplier barcodes without silently picking duplicate matches", () => {
  const products = [
    product("products:a", { sku: "LEG-1", barcode: "00123" }),
    product("products:b", { barcode: "00123" }),
    product("products:c", { sku: "OFF", active: false }),
  ];
  assert.equal(
    helpers.findScannedProducts(
      products,
      helpers.productScanCode("products:a"),
    )[0]._id,
    "products:a",
  );
  assert.equal(helpers.findScannedProducts(products, "leg-1").length, 1);
  assert.equal(helpers.findScannedProducts(products, "00123").length, 2);
  assert.equal(
    helpers.findScannedProducts(
      products,
      helpers.productScanCode("products:foreign"),
    ).length,
    0,
  );
  assert.equal(helpers.findScannedProducts(products, "OFF").length, 0);
  assert.equal(helpers.findScannedProducts(products, "").length, 0);
  assert.equal(
    helpers.searchRetailProducts(
      [product("products:a", { name: "Café especial" })],
      "cafe",
    ).length,
    1,
  );
});
test("batch capture creates independent variant stocks and remains compatible with existing product fields", async () => {
  const db = database([product("products:old")]);
  const ids = await db.run(
    retail.createProducts,
    capture({
      name: "Creme",
      unit: "un",
      variants: [
        {
          options: [{ name: "Volume", value: "100 ml" }],
          stock: 3,
          barcode: "00123",
        },
        { options: [{ name: "Volume", value: "200 ml" }], stock: 5 },
      ],
    }),
  );
  assert.equal(ids.length, 2);
  assert.equal(db.get(ids[0]).name, "Creme — 100 ml");
  assert.equal(db.get(ids[1]).stock, 5);
  assert.equal(db.get(ids[0]).barcode, "00123");
  assert.equal(db.get(ids[1]).userId, "seller");
  assert.equal(db.get("products:old").stock, 10);
});
test("retrying a capture is idempotent, while changing a submitted request is rejected", async () => {
  const db = database();
  const args = capture();
  const ids = await db.run(retail.createProducts, args);
  assert.deepEqual(await db.run(retail.createProducts, args), ids);
  assert.equal(db.all("products").length, 1);
  await assert.rejects(
    db.run(retail.createProducts, { ...args, name: "Outro nome" }),
  );
  assert.equal(db.all("products").length, 1);
});
test("capture requires login, business ownership, photo ownership and unique existing codes", async () => {
  await assert.rejects(
    database([], null).run(retail.createProducts, capture()),
  );
  const db = database([
    product("products:a", { sku: "0001" }),
    { _id: "businesses:other", userId: "another" },
    { _id: "retailPhotos:1", storageId: "_storage:other", userId: "another" },
  ]);
  await assert.rejects(
    db.run(retail.createProducts, capture({ businessId: "businesses:other" })),
  );
  await assert.rejects(
    db.run(retail.createProducts, capture({ photoId: "_storage:other" })),
  );
  await assert.rejects(
    db.run(
      retail.createProducts,
      capture({ variants: [{ options: [], stock: 1, barcode: "0001" }] }),
    ),
  );
  assert.equal(db.all("products").length, 1);
});
test("own photo can be attached without altering other users files", async () => {
  const db = database([
    { _id: "retailPhotos:1", storageId: "_storage:own", userId: "seller" },
  ]);
  const ids = await db.run(
    retail.createProducts,
    capture({ photoId: "_storage:own" }),
  );
  assert.equal(db.get(ids[0]).imageStorageId, "_storage:own");
  assert.equal(db.get(ids[0]).imageUrl, "https://example.test/_storage:own");
});
test("photo suggestion budgets are per account and reject anonymous or rapid repeated calls", async () => {
  await assert.rejects(
    database([], null).run(retail.reservePhotoSuggestion, {}),
  );
  const db = database();
  await db.run(retail.reservePhotoSuggestion, {});
  await assert.rejects(db.run(retail.reservePhotoSuggestion, {}));
  assert.equal(db.all("retailPhotoUsage")[0].count, 1);
});
test("paid sale atomically updates stock, client history, cash flow and reports using server names", async () => {
  const db = database([
    product(),
    { _id: "customers:1", userId: "seller", totalSpent: 100, totalOrders: 1 },
  ]);
  const id = await db.run(
    financial.addPDVSale,
    sale({ customerId: "customers:1", discount: 5 }),
  );
  assert.equal(db.get("products:a").stock, 8);
  assert.equal(db.get("products:a").totalSold, 2);
  assert.equal(db.get(id).items[0].productName, "Caderno");
  assert.equal(db.get(id).totalRevenue, 45);
  assert.equal(db.get(id).profit, 25);
  assert.equal(db.get(id).productName, "Caderno");
  assert.equal(db.get("customers:1").totalSpent, 145);
  assert.equal(db.all("cashFlow")[0].saleId, id);
  assert.equal(db.all("cashFlow")[0].amount, 45);
  assert.equal(db.jobs.length, 3);
});
test("pending sale reduces stock and records receivable without increasing received cash", async () => {
  const db = database([product()]);
  const id = await db.run(
    financial.addPDVSale,
    sale({ paymentStatus: "pending" }),
  );
  assert.equal(db.get("products:a").stock, 8);
  assert.equal(db.get(id).paymentStatus, "pending");
  assert.equal(db.all("cashFlow").length, 0);
});
test("legacy sale callers without request IDs remain supported", async () => {
  const db = database([product()]);
  const args = sale();
  delete args.requestId;
  const id = await db.run(financial.addPDVSale, args);
  assert.ok(id);
  assert.equal(db.get("products:a").stock, 8);
});
test("retries never duplicate sale, stock deduction, client totals or cash movements", async () => {
  const db = database([
    product(),
    { _id: "customers:1", userId: "seller", totalSpent: 0, totalOrders: 0 },
  ]);
  const args = sale({ customerId: "customers:1" });
  const id = await db.run(financial.addPDVSale, args);
  assert.equal(await db.run(financial.addPDVSale, args), id);
  assert.equal(db.all("sales").length, 1);
  assert.equal(db.all("cashFlow").length, 1);
  assert.equal(db.get("products:a").stock, 8);
  assert.equal(db.get("customers:1").totalOrders, 1);
  await assert.rejects(db.run(financial.addPDVSale, { ...args, discount: 1 }));
  assert.equal(db.get("products:a").stock, 8);
});
test("negative, zero, fractional units, oversized discounts, stale prices and foreign records cannot create sales", async () => {
  for (const quantity of [-1, 0, 0.5, 11, NaN, Infinity]) {
    const db = database([product()]);
    await assert.rejects(
      db.run(
        financial.addPDVSale,
        sale({ items: [{ ...sale().items[0], quantity }] }),
      ),
    );
    assert.equal(db.get("products:a").stock, 10);
    assert.equal(db.all("sales").length, 0);
  }
  for (const changes of [
    { discount: -1 },
    { discount: 51 },
    { discount: 1.001 },
    { paymentMethod: "invalid" },
    { paymentStatus: "cancelled" },
    { date: "2026-02-30" },
    { items: [{ ...sale().items[0], salePrice: 1 }] },
    { items: [{ ...sale().items[0], costPrice: 0 }] },
    { customerId: "customers:other" },
  ]) {
    const db = database([
      product(),
      { _id: "customers:other", userId: "another" },
    ]);
    await assert.rejects(db.run(financial.addPDVSale, sale(changes)));
    assert.equal(db.get("products:a").stock, 10);
  }
  const foreign = database([product("products:a", { userId: "another" })]);
  await assert.rejects(foreign.run(financial.addPDVSale, sale()));
});
test("a later invalid item rolls back the entire sale, including stock of the first item", async () => {
  const db = database([product(), product("products:b", { stock: 0 })]);
  await assert.rejects(
    db.run(
      financial.addPDVSale,
      sale({
        items: [
          sale().items[0],
          { ...sale().items[0], productId: "products:b" },
        ],
      }),
    ),
  );
  assert.equal(db.get("products:a").stock, 10);
  assert.equal(db.all("sales").length, 0);
  assert.equal(db.all("cashFlow").length, 0);
});
test("duplicate line items cannot oversell the same stock", async () => {
  const db = database([product("products:a", { stock: 3 })]);
  await assert.rejects(
    db.run(
      financial.addPDVSale,
      sale({ items: [sale().items[0], sale().items[0]] }),
    ),
  );
  assert.equal(db.get("products:a").stock, 3);
});
test("measured sales and cent rounding produce exact stock and financial totals", async () => {
  const db = database([
    product("products:a", {
      unit: "kg",
      stock: 0.5,
      costPrice: 10,
      salePrice: 20,
    }),
  ]);
  const id = await db.run(
    financial.addPDVSale,
    sale({
      items: [
        { ...sale().items[0], quantity: 0.333, costPrice: 10, salePrice: 20 },
      ],
      discount: 1.1,
    }),
  );
  assert.equal(db.get("products:a").stock, 0.167);
  assert.equal(db.get(id).totalRevenue, 5.56);
  assert.equal(db.get(id).totalCost, 3.33);
  assert.equal(db.get(id).profit, 2.23);
  assert.equal(db.get(id).items[0].unit, "kg");
});
test("repeated measured lines are merged before cent rounding and restore the same quantities", async () => {
  const db = database([
    product("products:a", {
      unit: "kg",
      stock: 1,
      costPrice: 0.05,
      salePrice: 0.1,
    }),
  ]);
  const item = {
    ...sale().items[0],
    quantity: 0.333,
    costPrice: 0.05,
    salePrice: 0.1,
  };
  const id = await db.run(financial.addPDVSale, sale({ items: [item, item] }));
  assert.equal(db.get(id).items.length, 1);
  assert.equal(db.get(id).totalRevenue, 0.07);
  assert.equal(db.get(id).totalCost, 0.03);
  assert.equal(db.get(id).profit, 0.04);
  assert.equal(db.get("products:a").totalProfit, 0.04);
  await db.run(financial.deleteSale, { id, permanent: true });
  assert.equal(db.get("products:a").stock, 1);
  assert.equal(db.get("products:a").totalProfit, 0);
});
test("deleting a multi-item sale restores every stock and only its linked cash entry", async () => {
  const db = database([
    product(),
    product("products:b", { unit: "kg", stock: 5 }),
    {
      _id: "cashFlow:unrelated",
      userId: "seller",
      type: "in",
      date: "2026-11-13",
      amount: 62.5,
    },
  ]);
  const id = await db.run(
    financial.addPDVSale,
    sale({
      items: [
        sale().items[0],
        { ...sale().items[0], productId: "products:b", quantity: 0.5 },
      ],
    }),
  );
  await db.run(financial.deleteSale, { id, permanent: true });
  assert.equal(db.get("products:a").stock, 10);
  assert.equal(db.get("products:b").stock, 5);
  assert.equal(db.all("sales").length, 0);
  assert.equal(db.all("cashFlow").length, 1);
  assert.equal(db.all("cashFlow")[0]._id, "cashFlow:unrelated");
});
test("deleting a pending sale does not delete an unrelated received payment with the same amount", async () => {
  const db = database([
    product(),
    {
      _id: "cashFlow:unrelated",
      userId: "seller",
      type: "in",
      date: "2026-11-13",
      amount: 50,
    },
  ]);
  const id = await db.run(
    financial.addPDVSale,
    sale({ paymentStatus: "pending" }),
  );
  await db.run(financial.deleteSale, { id, permanent: true });
  assert.equal(db.all("cashFlow").length, 1);
  assert.equal(db.get("products:a").stock, 10);
});
test("receiving a pending payment creates one cash entry without deducting stock again", async () => {
  const db = database([product()]);
  const id = await db.run(
    financial.addPDVSale,
    sale({ paymentStatus: "pending" }),
  );
  const args = { saleId: id, date: "2026-11-13", paymentMethod: "cash" };
  assert.equal((await db.run(retail.receiveSale, args)).alreadyPaid, false);
  assert.equal(db.get(id).paymentStatus, "paid");
  assert.equal(db.get("products:a").stock, 8);
  assert.equal(db.all("cashFlow").length, 1);
  assert.equal(db.all("cashFlow")[0].amount, 50);
  assert.equal((await db.run(retail.receiveSale, args)).alreadyPaid, true);
  assert.equal(db.all("cashFlow").length, 1);
});
test("receiving rejects foreign sales, invalid dates and cancelled sales", async () => {
  const db = database([product()]);
  const id = await db.run(
    financial.addPDVSale,
    sale({ paymentStatus: "pending" }),
  );
  await assert.rejects(
    db.run(retail.receiveSale, {
      saleId: id,
      date: "2026-11-12",
      paymentMethod: "pix",
    }),
  );
  await assert.rejects(
    db.run(retail.receiveSale, {
      saleId: id,
      date: "2026-99-99",
      paymentMethod: "pix",
    }),
  );
  await assert.rejects(
    database([{ ...db.get(id), userId: "other" }]).run(retail.receiveSale, {
      saleId: id,
      date: "2026-11-13",
      paymentMethod: "pix",
    }),
  );
  await db.ctx.db.patch(id, { paymentStatus: "cancelled" });
  await assert.rejects(
    db.run(retail.receiveSale, {
      saleId: id,
      date: "2026-11-13",
      paymentMethod: "pix",
    }),
  );
  assert.equal(db.all("cashFlow").length, 0);
});
test("deleting a sale received on another day removes the linked payment and restores stock", async () => {
  const db = database([product()]);
  const id = await db.run(
    financial.addPDVSale,
    sale({ date: "2026-11-12", paymentStatus: "pending" }),
  );
  await db.run(retail.receiveSale, {
    saleId: id,
    date: "2026-11-13",
    paymentMethod: "pix",
  });
  await db.run(financial.deleteSale, { id, permanent: true });
  assert.equal(db.all("cashFlow").length, 0);
  assert.equal(db.get("products:a").stock, 10);
});
test("photo upload binds the stored bytes to the authenticated owner and rejects invalid files", async () => {
  const db = database();
  let stored = 0,
    claimed = 0;
  db.ctx.storage = {
    store: async (blob) => {
      assert.equal(blob.type, "image/jpeg");
      stored++;
      return "_storage:photo";
    },
    getUrl: async () => "https://example.test/photo",
    delete: async () => {
      stored--;
    },
  };
  db.ctx.runMutation = async (_ref, args) => {
    assert.equal(args.userId, "seller");
    assert.equal(args.storageId, "_storage:photo");
    claimed++;
  };
  const result = await retail.storeProductPhoto._handler(db.ctx, {
    dataUrl: "data:image/jpeg;base64,/9j/2Q==",
  });
  assert.equal(result.storageId, "_storage:photo");
  assert.equal(stored, 1);
  assert.equal(claimed, 1);
  for (const dataUrl of [
    "data:image/svg+xml;base64,AAAA",
    "data:image/jpeg;base64,AAAA",
    "x".repeat(650001),
  ])
    await assert.rejects(
      retail.storeProductPhoto._handler(db.ctx, { dataUrl }),
    );
  assert.equal(stored, 1);
});
test("photo suggestion route requires an Ultra account and never calls the provider for blocked requests", async () => {
  let userId = null,
    plan = "free",
    providerCalls = 0;
  const route = load("app/api/retail/describe/route.ts", {
    "@clerk/nextjs/server": {
      auth: async () => ({ userId, getToken: async () => "fake-token" }),
    },
    "@/lib/subscription": { getUserSubscriptionPlan: async () => ({ plan }) },
    "convex/nextjs": { fetchMutation: async () => {} },
    "@/convex/_generated/api": { api: require("convex/server").anyApi },
  });
  const originalFetch = global.fetch,
    oldKey = process.env.GROQ_API_KEY;
  process.env.GROQ_API_KEY = "fake-key-for-local-tests";
  global.fetch = async () => {
    providerCalls++;
    throw new Error("Must not call provider");
  };
  try {
    assert.equal(
      (
        await route.POST(
          new Request("https://example.test", { method: "POST", body: "{}" }),
        )
      ).status,
      401,
    );
    userId = "seller";
    assert.equal(
      (
        await route.POST(
          new Request("https://example.test", { method: "POST", body: "{}" }),
        )
      ).status,
      403,
    );
    plan = "ultra";
    assert.equal(
      (
        await route.POST(
          new Request("https://example.test", { method: "POST", body: "{}" }),
        )
      ).status,
      400,
    );
    assert.equal(providerCalls, 0);
  } finally {
    global.fetch = originalFetch;
    if (oldKey === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = oldKey;
  }
});
test("photo suggestion only returns descriptive fields and gracefully handles provider failures", async () => {
  let quota = 0;
  const route = load("app/api/retail/describe/route.ts", {
    "@clerk/nextjs/server": {
      auth: async () => ({
        userId: "seller",
        getToken: async () => "fake-token",
      }),
    },
    "@/lib/subscription": {
      getUserSubscriptionPlan: async () => ({ plan: "ultra" }),
    },
    "convex/nextjs": {
      fetchMutation: async () => {
        quota++;
      },
    },
    "@/convex/_generated/api": { api: require("convex/server").anyApi },
  });
  const originalFetch = global.fetch,
    oldKey = process.env.GROQ_API_KEY;
  process.env.GROQ_API_KEY = "fake-key-for-local-tests";
  const request = () =>
    new Request("https://example.test", {
      method: "POST",
      body: JSON.stringify({ dataUrl: "data:image/jpeg;base64,/9j/2Q==" }),
    });
  try {
    global.fetch = async (url, options) => {
      assert.equal(url, "https://api.groq.com/openai/v1/chat/completions");
      const sent = JSON.parse(options.body);
      assert.equal(
        sent.messages[1].content[1].image_url.url,
        "data:image/jpeg;base64,/9j/2Q==",
      );
      return Response.json({
        choices: [
          {
            message: {
              content: JSON.stringify({
                name: "Café",
                category: "Alimentos",
                description: "Pacote de café.",
                costPrice: 1,
                salePrice: 10,
                stock: 99,
              }),
            },
          },
        ],
      });
    };
    const response = await route.POST(request());
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      name: "Café",
      category: "Alimentos",
      description: "Pacote de café.",
    });
    assert.equal(quota, 1);
    global.fetch = async () => new Response("", { status: 503 });
    assert.equal((await route.POST(request())).status, 502);
    delete process.env.GROQ_API_KEY;
    assert.equal((await route.POST(request())).status, 503);
  } finally {
    global.fetch = originalFetch;
    if (oldKey === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = oldKey;
  }
});
