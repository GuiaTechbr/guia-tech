import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { criarSessaoAdmin, lerSessaoAdmin, verificarSessaoAdmin, DURACAO_SESSAO_SEGUNDOS } from "../../src/lib/session.ts";
import { produtoInput, produtoEdicaoInput, produtoExclusaoInput, loginInput } from "../../src/lib/admin-input.ts";
import { lerJson } from "../../src/lib/api-json.ts";

const agora = Date.parse("2026-09-23T12:00:00Z");
const basico = { nome: " Câmera de teste ", marca: " Marca ", categoria: "Categoria personalizada" };

test("sessão válida expira no servidor após sete dias, mesmo reenviando o cookie", (t) => {
  const anterior = process.env.AUTH_SECRET;
  process.env.AUTH_SECRET = "segredo-exclusivamente-ficticio-para-testes";
  t.after(() => {
    if (anterior === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = anterior;
  });
  const token = criarSessaoAdmin(7, agora);
  assert.equal(lerSessaoAdmin(token, agora).adminId, 7);
  const fim = agora + DURACAO_SESSAO_SEGUNDOS * 1000;
  assert.equal(verificarSessaoAdmin(token, fim - 1), true);
  assert.equal(verificarSessaoAdmin(token, fim), false);
  assert.equal(verificarSessaoAdmin(token, fim + 100000), false);
  assert.equal(verificarSessaoAdmin(token, agora - 1000), false);
  assert.equal(verificarSessaoAdmin(token.replace("v1.7.", "v1.8."), agora), false);
  const partes = token.split(".");
  partes[3] = String(Number(partes[3]) + 3600);
  assert.equal(verificarSessaoAdmin(partes.join("."), agora), false);

  const antigo = "7." + createHmac("sha256", process.env.AUTH_SECRET).update("7").digest("hex");
  for (const valor of [antigo, undefined, "", token + ".extra", token.replace(/.$/, "é"), token.replace("v1.7.", "v1.07."), "a".repeat(10000)]) {
    assert.equal(lerSessaoAdmin(valor, agora), null);
  }
  const payload = `v1.7.${Math.floor(agora / 1000)}.${Math.floor(fim / 1000) + 60}`;
  const prazoExcessivo = payload + "." + createHmac("sha256", process.env.AUTH_SECRET).update(payload).digest("hex");
  assert.equal(lerSessaoAdmin(prazoExcessivo, agora), null);
  for (const id of [0, -1, 1.5, NaN, Infinity, 2147483648]) assert.throws(() => criarSessaoAdmin(id, agora));
  process.env.AUTH_SECRET = "outro-segredo-ficticio";
  assert.equal(verificarSessaoAdmin(token, agora), false);
});

test("cadastro conserva opcionais vazios, categorias próprias e preços zero/decimais", () => {
  const dados = produtoInput.parse({ ...basico, id: 100, criadoEm: "forjado", preco: "", imagem: "  ", descricao: null });
  assert.equal(dados.nome, "Câmera de teste");
  assert.equal(dados.categoria, basico.categoria);
  assert.equal(dados.descricao, null);
  assert.equal(dados.preco, null);
  assert.equal(dados.imagem, null);
  assert.equal(dados.videoOficial, null);
  assert.equal("id" in dados, false);
  assert.equal("criadoEm" in dados, false);
  for (const [entrada, esperado] of [[0, 0], ["0", 0], ["299,90", 299.9], ["299.90", 299.9], [null, null]]) {
    assert.equal(produtoInput.parse({ ...basico, preco: entrada }).preco, esperado);
  }
  for (const imagem of ["/produtos/camera.png", "https://m.media-amazon.com/images/I/imagem.jpg"]) {
    assert.equal(produtoInput.parse({ ...basico, imagem }).imagem, imagem);
  }
  assert.equal(produtoEdicaoInput.parse({ ...basico, id: "27" }).id, 27);
});

test("API recusa campos ausentes, tipos indevidos, preços inválidos e links executáveis", () => {
  for (const dados of [null, [], {}, { ...basico, nome: "  " }, { ...basico, nome: "a".repeat(251) }, { ...basico, marca: 1 }, { ...basico, descricao: {} }, { ...basico, destaques: false }, { ...basico, fichaTecnica: "x".repeat(10001) }]) {
    assert.equal(produtoInput.safeParse(dados).success, false);
  }
  for (const preco of [-1, "-1", true, [], {}, "abc", "1e4", "0x20", NaN, Infinity, "Infinity", 1000000000, "1.234,50", "1.001", 0.001]) {
    assert.equal(produtoInput.safeParse({ ...basico, preco }).success, false, String(preco));
  }
  for (const campo of ["imagem", "linkAfiliado", "videoOficial"]) {
    for (const link of ["javascript:alert(1)", "data:text/html,oi", "//example.com", "/\\example.com", "https://usuario:senha@example.com", "https://example.com\n.evil.test"]) {
      assert.equal(produtoInput.safeParse({ ...basico, [campo]: link }).success, false, `${campo}: ${link}`);
    }
  }
  for (const id of [undefined, null, 0, -1, 1.5, "1e2", "01", true, [], 2147483648]) {
    assert.equal(produtoExclusaoInput.safeParse({ id }).success, false);
  }
});

test("login valida dados e preserva a senha exatamente como digitada", () => {
  const entrada = loginInput.parse({ email: " TESTE@example.invalid ", senha: " senha com espaços " });
  assert.equal(entrada.email, "teste@example.invalid");
  assert.equal(entrada.senha, " senha com espaços ");
  for (const dados of [null, [], {}, { email: "invalido", senha: "abc" }, { email: entrada.email, senha: 123 }, { email: entrada.email, senha: "x".repeat(1025) }]) {
    assert.equal(loginInput.safeParse(dados).success, false);
  }
});

test("leitura JSON rejeita formato inválido, tipo incorreto e excesso de bytes", async () => {
  const request = (body, headers = { "Content-Type": "application/json" }) => new Request("http://localhost/api/teste", { method: "POST", headers, body });
  assert.deepEqual(await lerJson(request('{"nome":"Câmera"}')), { nome: "Câmera" });
  await assert.rejects(lerJson(request("{}", { "Content-Type": "text/plain" })), { status: 415 });
  await assert.rejects(lerJson(request("{")), { status: 400 });
  await assert.rejects(lerJson(request("{}", { "Content-Type": "application/json", "Content-Length": "10000" }), 20), { status: 413 });
  // Sem Content-Length e com caracteres multibyte: conta bytes, não caracteres.
  await assert.rejects(lerJson(request(JSON.stringify("á".repeat(11))), 20), { status: 413 });
  let cancelado = false;
  const stream = new ReadableStream({
    pull(controller) { controller.enqueue(new TextEncoder().encode("x".repeat(10))); },
    cancel() { cancelado = true; },
  });
  const req = new Request("http://localhost", { method: "POST", headers: { "Content-Type": "application/json" }, body: stream, duplex: "half" });
  await assert.rejects(lerJson(req, 20), { status: 413 });
  assert.equal(cancelado, true);
});
