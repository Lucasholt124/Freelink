const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const Module = require("node:module");
const esbuild = require("esbuild");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const project = path.resolve(__dirname, "..");
function bundle(relative) {
  const filename = path.join(__dirname, "__public-profile-test.cjs");
  const loaded = new Module(filename, module);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(__dirname);
  loaded._compile(
    esbuild.buildSync({
      entryPoints: [path.join(project, relative)],
      bundle: true,
      platform: "node",
      jsx: "automatic",
      format: "cjs",
      packages: "external",
      loader: { ".css": "empty", ".module.css": "empty" },
      write: false,
    }).outputFiles[0].text,
    filename,
  );
  return loaded.exports;
}
const helpers = bundle("lib/public-profile.ts");
const Profile = bundle("components/public-profile/ProfileView.tsx").default;
const links = [
  {
    _id: "first",
    title: "Fale comigo",
    url: "https://wa.me/5500000000000",
    isFeatured: true,
  },
  {
    _id: "second",
    title: "Meu trabalho",
    url: "https://example.com/portfolio",
    badgeType: "new",
  },
];
function render(extra = {}) {
  return renderToStaticMarkup(
    React.createElement(Profile, {
      username: "perfil-teste",
      profile: {
        displayName: "Minha Marca",
        description: "Meu trabalho em um só lugar.",
      },
      links,
      plan: "free",
      dark: false,
      feedback: "",
      onTheme() {},
      onShare() {},
      onQr() {},
      onLink() {},
      ...extra,
    }),
  );
}
test("owner links retain their order and destinations; the single platform link is a separate footer action", () => {
  const html = render();
  assert.ok(
    html.indexOf('href="https://wa.me/') <
      html.indexOf('href="https://example.com/portfolio"'),
  );
  assert.ok(
    html.indexOf('href="https://example.com/portfolio"') <
      html.indexOf("<footer"),
  );
  const footer = html.slice(html.indexOf("<footer"));
  assert.equal((footer.match(/<a\b/g) || []).length, 1);
  assert.match(footer, /Conheça o Freelinnk/);
  assert.match(footer, /target="_blank"/);
  assert.doesNotMatch(
    html,
    /Crie seu perfil|Começar Grátis|Quer um perfil assim/,
  );
  for (const anchor of html.match(/<a\b[^>]*>[\s\S]*?<\/a>/g) || [])
    assert.doesNotMatch(anchor, /<button\b/);
});
test("paid plans continue without platform attribution", () => {
  for (const plan of ["pro", "ultra"]) {
    const html = render({ plan });
    assert.doesNotMatch(
      html,
      /Conheça o Freelinnk|Sobre a plataforma Freelinnk/,
    );
    assert.match(html, /Meu trabalho/);
  }
});
test("legacy profiles with links remain usable without a customization record", () => {
  const html = render({ profile: null });
  assert.match(html, /@perfil-teste/);
  assert.match(html, /Fale comigo/);
  assert.match(html, /href="https:\/\/example.com\/portfolio"/);
});
test("only saved badge settings are used and link names and profile copy are escaped", () => {
  const html = render({
    links: [
      {
        _id: "x",
        title: '<img src=x onerror="alert(1)">',
        url: "https://example.com",
      },
    ],
  });
  assert.doesNotMatch(html, /<img src=x|>Novo<|>Popular</);
  assert.match(html, /&lt;img/);
  assert.match(html, /Links de Minha Marca/);
});
test("unsafe stored destinations never create executable links", () => {
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,hello",
    "file:///private",
    "https://user:secret@example.com",
    "https://example.com\n",
  ])
    assert.equal(helpers.publicLinkUrl(value), null);
  const html = render({
    links: [{ _id: "bad", title: "Antigo", url: "javascript:alert(1)" }],
  });
  assert.doesNotMatch(html, /href="javascript:/);
  assert.match(html, /Link indisponível/);
});
test("web addresses, contact links and destination labels stay understandable", () => {
  assert.equal(
    helpers.publicLinkUrl("example.com/contact"),
    "https://example.com/contact",
  );
  assert.equal(
    helpers.publicLinkUrl("mailto:oi@example.com"),
    "mailto:oi@example.com",
  );
  assert.equal(
    helpers.publicLinkUrl("tel:+5511999999999"),
    "tel:+5511999999999",
  );
  assert.equal(
    helpers.linkDestination("https://api.whatsapp.com/send?phone=123"),
    "WhatsApp",
  );
  assert.equal(
    helpers.linkDestination("https://whatsapp.com.evil.example"),
    "whatsapp.com.evil.example",
  );
  assert.equal(
    helpers.linkDestination("https://www.instagram.com/perfil"),
    "Instagram",
  );
});
test("status and multiline bio are retained without imposing promotional copy", () => {
  assert.deepEqual(
    helpers.profileBio("STATUS: Agenda aberta\nDesigner\nSão Paulo"),
    { status: "Agenda aberta", bio: "Designer\nSão Paulo" },
  );
  assert.deepEqual(helpers.profileBio("Minha bio"), {
    status: "",
    bio: "Minha bio",
  });
  const html = render({ links: [] });
  assert.match(html, /Novidades a caminho/);
  assert.doesNotMatch(html, /href="https:\/\/example.com/);
});
test("accent colors keep sensible text colors and invalid colors fall back to the brand", () => {
  assert.equal(helpers.accentText("#ffffff"), "#111111");
  assert.equal(helpers.accentText("#7144e8"), "#ffffff");
  assert.equal(helpers.accentText("#777777"), "#000000");
  assert.equal(helpers.profileAccent("#abc"), "#aabbcc");
  assert.equal(helpers.profileAccent("broken"), "#7144e8");
});
test("merchant colors stay the same in light and dark themes and explicit backgrounds are preserved", () => {
  for (const accent of ["#17724a", "#e68424", "#184fa8"]) {
    for (const dark of [false, true]) {
      const html = render({
        dark,
        profile: {
          displayName: "Minha Marca",
          accentColor: accent,
          backgroundType: "color",
          backgroundColor1: "#ffffff",
        },
      });
      assert.ok(html.includes(`--profile-accent:${accent}`));
      assert.ok(html.includes("background:#ffffff"));
    }
  }
  const gradient = render({
    profile: {
      accentColor: "#17724a",
      backgroundType: "gradient",
      backgroundColor1: "#17724a",
      backgroundColor2: "#a7d3b2",
    },
  });
  assert.ok(gradient.includes("linear-gradient(145deg, #17724a, #a7d3b2)"));
});
test("an uploaded cover remains available instead of being replaced by the brand color", () => {
  const html = render({
    profile: {
      displayName: "Minha Marca",
      accentColor: "#17724a",
      backgroundType: "image",
      backgroundStyle: "header",
      backgroundImageUrl: "/ImpulsioneWeb.jpeg",
    },
  });
  assert.match(html, /ImpulsioneWeb\.jpeg/);
  assert.equal((html.match(/<img\b/g) || []).length, 1);
});
