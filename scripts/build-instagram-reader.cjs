const fs = require("node:fs"),
  path = require("node:path"),
  cp = require("node:child_process");
const root = path.resolve(__dirname, "..");
const source = path.join(root, "extensions", "instagram-reader");
const output = path.join(root, ".next", "instagram-reader-package");
fs.mkdirSync(output, { recursive: true });
for (const name of ["manifest.json", "background.js", "bridge.js"])
  fs.copyFileSync(path.join(source, name), path.join(output, name));
const esbuild = require("esbuild");
esbuild.buildSync({
  entryPoints: [path.join(root, "lib", "instagram-giveaway.ts")],
  bundle: true,
  platform: "browser",
  format: "esm",
  outfile: path.join(output, "connector-core.js"),
  minify: true,
});
esbuild.buildSync({
  entryPoints: [path.join(source, "collector-entry.js")],
  bundle: true,
  platform: "browser",
  format: "iife",
  outfile: path.join(output, "collector.js"),
  minify: true,
});
fs.writeFileSync(
  path.join(output, "LEIA-ME.txt"),
  `FREELINNK - LEITOR EXPERIMENTAL DE COMENTARIOS\n\n1. Extraia este ZIP numa pasta.\n2. No Chrome, abra chrome://extensions; no Edge, edge://extensions.\n3. Ative o modo de desenvolvedor e escolha Carregar sem compactacao.\n4. Selecione esta pasta. Recarregue a ferramenta de sorteios do Freelinnk.\n5. Escolha Comentarios do Instagram. Prepare o sorteio e cole o link da publicacao ou da live.\n6. Abra os comentarios no Instagram. Se necessario, use Indicar um comentario no painel do leitor.\n7. Volte ao Freelinnk, encerre a captura, confira a lista e as regras e confirme a revisao.\n\nLIMITES\n- Exige computador e Instagram acessivel no navegador. Nao e uma conexao com a API da Meta.\n- Le apenas comentarios carregados; nao garante todos os comentarios da publicacao. Nao verifica seguidores ou curtidas.\n- Comentarios identicos sem identificador nativo contam uma vez. Ate 5.000 comentarios por captura.\n- Dados e resultados ficam no navegador do Freelinnk. Exporte o registro para manter uma copia.\n- Nao solicita senhas ou cookies, nao envia dados a fornecedores, nao curte nem segue perfis.\n- O desenho das paginas do Instagram pode mudar. Valide uma coleta real antes de usar em sorteio com participantes.\n- Este pacote ainda nao foi publicado na Chrome Web Store.\n`,
  "utf8",
);
const destination = path.join(
  root,
  "public",
  "downloads",
  "freelinnk-instagram-reader.zip",
);
fs.mkdirSync(path.dirname(destination), { recursive: true });
const python =
  process.env.PYTHON || (process.platform === "win32" ? "python" : "python3");
const code =
  'import pathlib,sys,zipfile; root=pathlib.Path(sys.argv[1]); out=pathlib.Path(sys.argv[2]); names=["manifest.json","background.js","bridge.js","collector.js","connector-core.js","LEIA-ME.txt"]; z=zipfile.ZipFile(out,"w",zipfile.ZIP_DEFLATED); [z.write(root/name,name) for name in names]; z.close()';
cp.execFileSync(python, ["-c", code, output, destination], {
  stdio: "inherit",
  windowsHide: true,
});
console.log(
  "Pacote do leitor gerado: public/downloads/freelinnk-instagram-reader.zip",
);
