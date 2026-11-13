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
const envNames = ["RESEND_API_KEY", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "CLERK_WEBHOOK_SECRET", "CRON_SECRET", "GROQ_API_KEY"];
let constructions = 0;
class UnavailableClient { constructor() { constructions++; throw new Error("Provider must not initialize during import"); } }
const next = { NextResponse: class extends Response { static json(body, options) { return Response.json(body, options); } } };
const stubs = { "resend": { Resend: UnavailableClient }, "stripe": { __esModule: true, default: UnavailableClient }, "openai": { __esModule: true, default: UnavailableClient }, "@clerk/nextjs/server": { auth: async () => ({ userId: null }), clerkClient: async () => { throw new Error("No external Clerk access"); } }, "next/server": next, "next/headers": { headers: async () => new Headers() } };
test("optional integrations import without keys and fail clearly at request time without sending anything", async () => {
  const saved = Object.fromEntries(envNames.map(name => [name, process.env[name]]));
  for (const name of envNames) delete process.env[name];
  try {
    const marketing = load("app/api/cron/marketing-system/route.ts", stubs);
    const clerkWebhook = load("app/api/webhooks/clerk/route.ts", stubs);
    const stripeWebhook = load("app/api/stripe/webhook/route.ts", stubs);
    const bio = load("app/api/generate-bio/route.ts", stubs);
    const payment = load("lib/stripe.ts", stubs);
    assert.equal(constructions, 0);
    assert.equal((await marketing.GET(new Request("https://example.test", { headers: { authorization: "Bearer undefined" } }))).status, 401);
    assert.equal((await clerkWebhook.POST(new Request("https://example.test", { method: "POST" }))).status, 503);
    assert.equal((await stripeWebhook.POST(new Request("https://example.test", { method: "POST" }))).status, 503);
    assert.equal((await bio.POST(new Request("https://example.test", { method: "POST" }))).status, 500);
    assert.throws(() => payment.getStripe(), /temporariamente indisponíveis/);
    assert.equal(constructions, 0);
  } finally { for (const name of envNames) { if (saved[name] === undefined) delete process.env[name]; else process.env[name] = saved[name]; } }
});
