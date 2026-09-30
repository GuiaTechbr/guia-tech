// Executar após npm run build. Toda gravação usa um banco fictício temporário.
import assert from "node:assert/strict";
import { cp, copyFile, mkdir, mkdtemp, readFile, rm, symlink, unlink } from "node:fs/promises";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { criarHashSenha } from "../../src/lib/auth.ts";

const repo = fileURLToPath(new URL("../../", import.meta.url));
const fixture = await mkdtemp(path.join(os.tmpdir(), "guia-tech-admin-http-"));
const digest = async () => createHash("sha256").update(await readFile(path.join(repo, "prisma/dev.db"))).digest("hex");
const original = await digest();
const secret = randomBytes(32).toString("hex");
const senha = randomBytes(24).toString("hex");
const email = "teste@example.invalid";
let child;
let linked = false;
let base;

const assinar = payload => payload + "." + createHmac("sha256", secret).update(payload).digest("hex");
const cookie = token => ({ "Content-Type": "application/json", Cookie: "guia_tech_admin=" + token });
const json = async (url, method, body, headers = { "Content-Type": "application/json" }) => fetch(base + url, { method, headers, body: JSON.stringify(body) });

async function iniciar(vercel) {
  const probe = createServer();
  probe.listen(0, "127.0.0.1");
  await once(probe, "listening");
  const port = probe.address().port;
  await new Promise(resolve => probe.close(resolve));
  base = `http://127.0.0.1:${port}`;
  child = spawn(process.execPath, [path.join(repo, "node_modules/next/dist/bin/next"), "start", fixture, "--hostname", "127.0.0.1", "--port", String(port)], {
    cwd: fixture,
    env: { ...process.env, GUIA_DATABASE_MODE: "sqlite", TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "", GUIA_TURSO_WRITE_ENABLED: "0", NODE_ENV: "production", VERCEL: vercel ? "1" : "0", AUTH_SECRET: secret, NEXT_TELEMETRY_DISABLED: "1" },
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let ready = false;
  let failed = false;
  child.on("error", () => { failed = true; });
  child.stdout.on("data", data => { if (data.toString().includes("Ready")) ready = true; });
  // Evita registrar respostas de login ou variáveis de ambiente em caso de falha.
  child.stderr.on("data", () => {});
  const fim = Date.now() + 30000;
  while (!ready && !failed && child.exitCode === null && Date.now() < fim) {
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  assert.ok(ready && !failed, "O servidor isolado não iniciou.");
}

async function parar() {
  if (!child || child.exitCode !== null) return;
  const stopped = once(child, "exit");
  child.kill();
  await stopped;
  child = undefined;
}

try {
  // Sem .env, catálogo real ou contas reais na cópia de execução.
  await cp(path.join(repo, ".next"), path.join(fixture, ".next"), {
    recursive: true,
    dereference: true,
    filter: source => !["cache", "dev"].includes(path.relative(path.join(repo, ".next"), source).split(path.sep)[0]),
  });
  await copyFile(path.join(repo, "package.json"), path.join(fixture, "package.json"));
  await copyFile(path.join(repo, "next.config.ts"), path.join(fixture, "next.config.ts"));
  await symlink(path.join(repo, "node_modules"), path.join(fixture, "node_modules"), "junction");
  linked = true;
  await mkdir(path.join(fixture, "prisma"));
  const db = new Database(path.join(fixture, "prisma/dev.db"));
  db.exec(`CREATE TABLE Produto (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, marca TEXT NOT NULL, categoria TEXT NOT NULL, descricao TEXT, preco REAL, imagem TEXT, linkAfiliado TEXT, videoOficial TEXT, destaques TEXT, fichaTecnica TEXT, pontosPositivos TEXT, pontosAtencao TEXT, criadoEm DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE Admin (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, senhaHash TEXT NOT NULL, criadoEm DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);`);
  db.prepare("INSERT INTO Admin (id,email,senhaHash) VALUES (?,?,?)").run(1, email, criarHashSenha(senha));
  db.close();

  await iniciar(false);
  assert.equal((await fetch(base + "/api/produtos")).status, 200);
  for (const pagina of ["/admin", "/admin/produtos"]) {
    const semLogin = await fetch(base + pagina, { redirect: "manual" });
    assert.equal(semLogin.status, 307);
    assert.equal(new URL(semLogin.headers.get("location"), base).pathname, "/admin/login");
  }
  for (const method of ["POST", "PUT", "DELETE"]) {
    assert.equal((await json("/api/produtos", method, {})).status, 401);
  }

  for (const dados of [null, [], {}, { email: "invalido", senha }, { email, senha: 123 }]) {
    assert.equal((await json("/api/admin/login", "POST", dados)).status, 400);
  }
  assert.equal((await fetch(base + "/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" })).status, 400);
  assert.equal((await json("/api/admin/login", "POST", { email, senha }, { "Content-Type": "text/plain" })).status, 415);
  assert.equal((await json("/api/admin/login", "POST", { email, senha: "x".repeat(9000) })).status, 413);
  const errada = await json("/api/admin/login", "POST", { email, senha: "senha-errada" });
  const inexistente = await json("/api/admin/login", "POST", { email: "outra@example.invalid", senha });
  assert.equal(errada.status, 401);
  assert.equal(inexistente.status, 401);
  assert.deepEqual(await errada.json(), await inexistente.json());

  const login = await json("/api/admin/login", "POST", { email: " TESTE@EXAMPLE.INVALID ", senha });
  assert.equal(login.status, 200);
  const setCookie = login.headers.get("set-cookie");
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /Secure/i);
  assert.match(setCookie, /SameSite=lax/i);
  assert.match(setCookie, /Max-Age=604800/i);
  const token = setCookie.match(/^guia_tech_admin=([^;]+)/)[1];
  assert.match(token, /^v1\.1\./);
  const headers = cookie(token);
  assert.equal((await fetch(base + "/admin/produtos", { headers })).status, 200);

  const now = Math.floor(Date.now() / 1000);
  const expirado = assinar(`v1.1.${now - 604801}.${now - 1}`);
  for (const invalido of [expirado, assinar("1"), token.replace("v1.1.", "v1.2."), assinar(`v1.1.${now + 600}.${now + 605400}`)]) {
    for (const method of ["POST", "PUT", "DELETE"]) {
      assert.equal((await json("/api/produtos", method, {}, cookie(invalido))).status, 401);
    }
    assert.equal((await fetch(base + "/admin/produtos", { headers: cookie(invalido), redirect: "manual" })).status, 307);
  }
  // Assinatura válida não basta quando a conta não existe.
  assert.equal((await json("/api/produtos", "POST", {}, cookie(assinar(`v1.99.${now}.${now + 604800}`)))).status, 401);

  const produto = { nome: " Câmera teste isolado ", marca: " Marca ", categoria: "Acessórios", preco: "299,90", imagem: "/produtos/teste.png", linkAfiliado: "https://example.com/produto", id: null };
  for (const dados of [null, [], {}, { ...produto, preco: -3 }, { ...produto, linkAfiliado: "javascript:alert(1)" }, { ...produto, descricao: {} }]) {
    assert.equal((await json("/api/produtos", "POST", dados, headers)).status, 400);
  }
  assert.equal((await json("/api/produtos", "POST", produto, { ...headers, "Content-Type": "text/plain" })).status, 415);
  assert.equal((await json("/api/produtos", "POST", { ...produto, descricao: "x".repeat(131072) }, headers)).status, 413);
  assert.equal((await (await fetch(base + "/api/produtos")).json()).length, 0);

  const criado = await json("/api/produtos", "POST", produto, headers);
  assert.equal(criado.status, 201);
  const salvo = await criado.json();
  assert.equal(salvo.nome, "Câmera teste isolado");
  assert.equal(salvo.preco, 299.9);
  assert.equal(salvo.descricao, null);
  const pagina = await fetch(base + "/produtos/" + salvo.id);
  assert.equal(pagina.status, 200);
  assert.match(await pagina.text(), /Câmera teste isolado/);
  const atualizado = await json("/api/produtos", "PUT", { ...produto, id: String(salvo.id), nome: "Nome atualizado teste", preco: "" }, headers);
  assert.equal(atualizado.status, 200);
  const edicao = await atualizado.json();
  assert.equal(edicao.preco, null);
  assert.equal(edicao.criadoEm, salvo.criadoEm);
  assert.match(await (await fetch(base + "/produtos/" + salvo.id)).text(), /Nome atualizado teste/);
  assert.equal((await json("/api/produtos", "PUT", { ...produto, id: salvo.id, nome: " " }, headers)).status, 400);
  assert.equal((await json("/api/produtos", "DELETE", { id: "1e1" }, headers)).status, 400);
  assert.equal((await json("/api/produtos", "PUT", { ...produto, id: 2147483647 }, headers)).status, 404);
  assert.equal((await json("/api/produtos", "DELETE", { id: 2147483647 }, headers)).status, 404);

  // Reiniciar com o mesmo banco confirma persistência local antes de excluir.
  await parar();
  await iniciar(false);
  const aposReinicio = await (await fetch(base + "/api/produtos")).json();
  assert.equal(aposReinicio.length, 1);
  assert.equal(aposReinicio[0].nome, "Nome atualizado teste");
  assert.equal((await json("/api/produtos", "DELETE", { id: salvo.id }, headers)).status, 200);
  assert.equal((await (await fetch(base + "/api/produtos")).json()).length, 0);

  await parar();
  await iniciar(true);
  for (const method of ["POST", "PUT", "DELETE"]) {
    assert.equal((await json("/api/produtos", method, {}, headers)).status, 503);
    assert.equal((await json("/api/produtos", method, {})).status, 401);
  }
  assert.match(await (await fetch(base + "/admin/produtos", { headers })).text(), /temporariamente em modo de consulta/);
  console.log("HTTP aprovado: login, cookies, sessões expiradas/adulteradas, validação, CRUD isolado, persistência após reinício, cache atualizado e Vercel em consulta.");
} finally {
  await parar();
  assert.equal(await digest(), original, "O banco real mudou durante a verificação.");
  // Confere o destino e remove a junção sem percorrer as dependências reais.
  assert.equal(path.dirname(fixture), os.tmpdir());
  assert.ok(path.basename(fixture).startsWith("guia-tech-admin-http-"));
  if (linked) await unlink(path.join(fixture, "node_modules"));
  await rm(fixture, { recursive: true, force: true });
}
