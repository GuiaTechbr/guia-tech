import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { pathToFileURL } from "node:url";
import Database from "better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { obterConfigBanco, podeGravarBanco } from "../../src/lib/database-config.ts";
import { compararBancos } from "../lib/comparar-bancos.mjs";

const remoto = { GUIA_DATABASE_MODE: "turso", TURSO_DATABASE_URL: "libsql://teste.turso.io", TURSO_AUTH_TOKEN: "token-ficticio" };

test("configuração mantém SQLite local, bloqueia Vercel e exige liberação explícita do Turso", () => {
  assert.deepEqual(obterConfigBanco({}), { modo: "sqlite", permiteGravacao: true });
  assert.equal(podeGravarBanco({ VERCEL: "1" }), false);
  assert.equal(podeGravarBanco(remoto), false);
  assert.equal(podeGravarBanco({ ...remoto, VERCEL: "1", GUIA_TURSO_WRITE_ENABLED: "1" }), true);
  assert.equal(podeGravarBanco({ ...remoto, GUIA_TURSO_WRITE_ENABLED: "0" }), false);
  for (const env of [
    { GUIA_DATABASE_MODE: "desconhecido" },
    { TURSO_AUTH_TOKEN: "token-ficticio" },
    { TURSO_DATABASE_URL: remoto.TURSO_DATABASE_URL },
    { ...remoto, GUIA_DATABASE_MODE: "sqlite" },
    { ...remoto, TURSO_AUTH_TOKEN: "" },
    { ...remoto, TURSO_DATABASE_URL: "" },
    { ...remoto, GUIA_TURSO_WRITE_ENABLED: "true" },
  ]) assert.throws(() => obterConfigBanco(env));
  for (const url of ["file:./dev.db", "http://teste.turso.io", "libsql://teste.turso.io?tls=0", "https://usuario:segredo@teste.turso.io", "https://teste.turso.io/caminho", "invalida"]) {
    assert.throws(() => obterConfigBanco({ ...remoto, TURSO_DATABASE_URL: url }));
  }
  assert.equal(obterConfigBanco({ ...remoto, TURSO_DATABASE_URL: "https://teste.turso.io" }).modo, "turso");
});

test("libSQL preserva todos os campos, datas antigas, IDs e sequências; conferência detecta divergências", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "guia-tech-libsql-"));
  const origem = path.join(dir, "origem.db");
  const destino = path.join(dir, "destino.db");
  const db = new Database(origem);
  let local;
  let copia;
  try {
    db.exec(`CREATE TABLE Produto (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, marca TEXT NOT NULL, categoria TEXT NOT NULL, descricao TEXT, preco REAL, imagem TEXT, linkAfiliado TEXT, videoOficial TEXT, destaques TEXT, fichaTecnica TEXT, pontosPositivos TEXT, pontosAtencao TEXT, criadoEm DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE Admin (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, senhaHash TEXT NOT NULL, criadoEm DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);`);
    db.prepare("INSERT INTO Produto VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)").run(27, "Câmera de teste", "Marca", "Casa Inteligente", "Descrição", 123.45, "/produtos/teste.png", "https://example.com/oferta", "https://example.com/video", "Destaque", "Ficha", "Ponto positivo", "Atenção", 1750000000000);
    db.prepare("INSERT INTO Admin (id,email,senhaHash,criadoEm) VALUES (?,?,?,?)").run(4, "teste@example.invalid", "hash-ficticio", "2026-09-23T10:00:00.000+00:00");
    db.exec("UPDATE sqlite_sequence SET seq=99 WHERE name='Produto'");
    await db.backup(destino);
    local = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: origem, readonly: true, fileMustExist: true }) });
    const makeClient = () => new PrismaClient({ adapter: new PrismaLibSql({ url: pathToFileURL(destino).href }) });
    copia = makeClient();
    assert.deepEqual(await compararBancos(local, copia), { produtos: 1, administradores: 1, campos: "iguais", sequencias: "iguais" });
    assert.equal((await copia.produto.findUniqueOrThrow({ where: { id: 27 } })).criadoEm.getTime(), 1750000000000);
    const novo = await copia.produto.create({ data: { nome: "Novo", marca: "Marca", categoria: "Acessórios" } });
    assert.equal(novo.id, 100);
    await copia.produto.update({ where: { id: 100 }, data: { nome: "Alterado" } });
    await copia.$disconnect();
    copia = makeClient();
    assert.equal((await copia.produto.findUniqueOrThrow({ where: { id: 100 } })).nome, "Alterado");
    await copia.produto.delete({ where: { id: 100 } });
    await assert.rejects(compararBancos(local, copia), /sequencias/);
    await copia.$executeRaw`UPDATE sqlite_sequence SET seq=99 WHERE name='Produto'`;
    await copia.produto.update({ where: { id: 27 }, data: { descricao: "Divergente" } });
    await assert.rejects(compararBancos(local, copia), /produtos/);
    await copia.produto.update({ where: { id: 27 }, data: { descricao: "Descrição" } });
    await copia.admin.update({ where: { id: 4 }, data: { senhaHash: "outra-hash-ficticia" } });
    await assert.rejects(compararBancos(local, copia), /administradores/);
    assert.equal(db.prepare('SELECT count(*) AS total FROM Produto').get().total, 1);
  } finally {
    await Promise.allSettled([local?.$disconnect(), copia?.$disconnect()]);
    db.close();
    assert.equal(path.dirname(dir), os.tmpdir());
    assert.ok(path.basename(dir).startsWith("guia-tech-libsql-"));
    await rm(dir, { recursive: true, force: true, maxRetries: 8, retryDelay: 150 });
  }
});
