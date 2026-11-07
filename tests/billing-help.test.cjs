const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
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
  const filename = path.join(project, "tests", "__billing-help-bundle.cjs");
  const loaded = new Module(filename, module);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  loaded._compile(output, filename);
  return loaded.exports;
}
const billing = bundle("lib/billing-options.ts");
const help = bundle("lib/help-center.ts");

test("annual offers preserve existing prices and show the actual savings", () => {
  assert.deepEqual(billing.billingPrices, {
    pro: { monthly: 3490, yearly: 34900 },
    ultra: { monthly: 7790, yearly: 77900 },
  });
  for (const plan of ["pro", "ultra"]) {
    assert.equal(
      billing.billingPrices[plan].yearly,
      billing.billingPrices[plan].monthly * 10,
    );
    assert.equal(
      billing.annualSaving(plan),
      billing.billingPrices[plan].monthly * 2,
    );
    assert.equal(billing.annualDiscount(plan), 17);
  }
  assert.equal(billing.money(7790), "R$ 77,90");
  assert.equal(
    billing.money((36980 - billing.billingPrices.ultra.monthly) * 12),
    "R$ 3.502,80",
  );
});
test("billing notes distinguish yearly total from monthly payment after the trial", () => {
  assert.match(
    billing.billingPriceNote("pro", "yearly"),
    /349,00 por ano, em uma única cobrança após o teste/,
  );
  assert.match(
    billing.billingPriceNote("ultra", "monthly"),
    /77,90 por mês após o teste/,
  );
});
test("plan presentation accepts stored plan names and keeps the administrator entitlement", () => {
  assert.equal(billing.billingPlan("Pro"), "pro");
  assert.equal(billing.billingPlan("ultra"), "ultra");
  assert.equal(billing.billingPlan("unknown"), "free");
  assert.equal(billing.billingPlan(null), "free");
  assert.equal(
    billing.billingPlan("free", "user_301NTkVsE3v48SXkoCEp0XOXifI"),
    "ultra",
  );
});
test("help search matches accents, aliases and several terms together", () => {
  assert.ok(
    help.findHelpArticles("ANUNCIOS").some((x) => x.id === "help-anuncios"),
  );
  assert.ok(
    help
      .findHelpArticles("WhatsApp mensagem")
      .some((x) => x.id === "help-whatsapp"),
  );
  assert.ok(help.findHelpArticles("fixar").some((x) => x.id === "help-ordem"));
  assert.ok(
    help.findHelpArticles("nao carrega").some((x) => x.id === "help-acesso"),
  );
  assert.equal(help.findHelpArticles("zzzznaoexiste").length, 0);
  assert.equal(help.findHelpArticles("   ").length, help.helpArticles.length);
});
test("help category filters keep the search scope and allow recovery to all topics", () => {
  assert.ok(help.findHelpArticles("faturas", "billing").length > 0);
  assert.ok(
    help
      .findHelpArticles("faturas", "billing")
      .every((x) => x.category === "billing"),
  );
  assert.equal(help.findHelpArticles("WhatsApp", "billing").length, 0);
  assert.ok(help.findHelpArticles("WhatsApp", "all").length > 0);
});
test("every help article has a unique shareable anchor and real destination", () => {
  const ids = help.helpArticles.map((x) => x.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const article of help.helpArticles) {
    assert.match(article.id, /^help-[a-z-]+$/);
    assert.ok(article.steps.length > 1);
    assert.ok(help.helpCategories.some((x) => x.id === article.category));
    if (article.action && "href" in article.action) {
      const route = article.action.href
        .split("#")[0]
        .replace(/^\/dashboard/, "");
      assert.ok(
        fs.existsSync(
          path.join(project, "app", "(admin)", "dashboard", route, "page.tsx"),
        ),
        article.action.href,
      );
    }
  }
});
test("support links use valid WhatsApp destinations and encode the chosen topic", () => {
  const saved = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  try {
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "invalid";
    const topic = "Cobrança anual & faturas?";
    const links = help.supportLinks(topic);
    const url = new URL(links.whatsapp);
    assert.equal(url.hostname, "wa.me");
    assert.equal(url.pathname, "/5579999383543");
    assert.ok(url.searchParams.get("text").endsWith(topic));
    assert.ok(
      links.email.startsWith("mailto:Lucasholt2021@gmail.com?subject="),
    );
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "+55 (79) 99938-3543";
    assert.equal(
      new URL(help.supportLinks().whatsapp).pathname,
      "/5579999383543",
    );
  } finally {
    if (saved === undefined) delete process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    else process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = saved;
  }
});
