import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, appendFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { podeGravarBanco } from "../../src/lib/database-config.ts";
import { createBackup, verifyBackup } from "../lib/backup.mjs";

test("local continua editável; Vercel sem banco remoto permite apenas leitura", () => {
  assert.equal(podeGravarBanco({}), true);
  assert.equal(podeGravarBanco({ VERCEL: "1" }), false);
});

test("backup inclui WAL, preserva IDs e campos; cópia restaurada mantém CRUD após reconexão", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "guia-tech-persistencia-"));
  const original = path.join(directory, "origem.db");
  const db = new Database(original);
  let prisma;
  try {
    db.pragma("journal_mode = WAL");
    db.exec(`CREATE TABLE Produto (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, marca TEXT NOT NULL, categoria TEXT NOT NULL, descricao TEXT, preco REAL, imagem TEXT, linkAfiliado TEXT, videoOficial TEXT, destaques TEXT, fichaTecnica TEXT, pontosPositivos TEXT, pontosAtencao TEXT, criadoEm DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE Admin (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, senhaHash TEXT NOT NULL, criadoEm DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);`);
    db.prepare("INSERT INTO Produto (id,nome,marca,categoria,preco,videoOficial,criadoEm) VALUES (?,?,?,?,?,?,?)").run(27,"Câmera de teste","Marca","Casa Inteligente",null,"https://example.com/video",1750000000000);
    db.prepare("INSERT INTO Admin (id,email,senhaHash) VALUES (?,?,?)").run(4,"teste@example.invalid","hash-ficticio");
    const backup = await createBackup(original, path.join(directory, "backups"));
    assert.equal(backup.produtos, 1);
    assert.equal(backup.administradores, 1);
    assert.equal((await verifyBackup(backup.databaseFile)).sha256, backup.sha256);
    assert.doesNotMatch(await readFile(path.join(path.dirname(backup.databaseFile), "manifesto.json"), "utf8"), /hash-ficticio|teste@example/);

    const makeClient = (readonly = false) => new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: backup.databaseFile, readonly, fileMustExist: true }) });
    prisma = makeClient();
    const product = await prisma.produto.findUniqueOrThrow({ where: { id: 27 } });
    assert.equal(product.criadoEm.getTime(), 1750000000000);
    assert.equal(product.videoOficial, "https://example.com/video");
    assert.equal(product.preco, null);
    const created = await prisma.produto.create({ data: { nome: "Novo", marca: "Marca", categoria: "Acessórios" } });
    assert.ok(created.id > 27);
    await prisma.produto.update({ where: { id: created.id }, data: { nome: "Atualizado" } });
    await prisma.$disconnect();
    prisma = makeClient();
    assert.equal((await prisma.produto.findUniqueOrThrow({ where: { id: created.id } })).nome, "Atualizado");
    assert.equal((await prisma.admin.findUniqueOrThrow({ where: { id: 4 } })).senhaHash, "hash-ficticio");
    await prisma.produto.delete({ where: { id: created.id } });
    assert.equal(await prisma.produto.count(), 1);
    assert.equal(db.prepare("SELECT nome FROM Produto WHERE id=27").get().nome, "Câmera de teste");
    await prisma.$disconnect();
    prisma = makeClient(true);
    assert.equal(await prisma.produto.count(), 1);
    await assert.rejects(prisma.produto.create({ data: { nome: "Bloqueado", marca: "Marca", categoria: "Acessórios" } }));
    await prisma.$disconnect();
    prisma = undefined;
    await appendFile(backup.databaseFile, "alteracao");
    await assert.rejects(verifyBackup(backup.databaseFile), /difere/);
  } finally {
    await prisma?.$disconnect();
    db.close();
    // Apenas a pasta temporária criada por este teste.
    assert.equal(path.dirname(directory), os.tmpdir());
    assert.ok(path.basename(directory).startsWith("guia-tech-persistencia-"));
    await rm(directory, { recursive: true, force: true });
  }
});
