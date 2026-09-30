import Database from "better-sqlite3";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

function inspect(databaseFile) {
  const db = new Database(databaseFile, { readonly: true, fileMustExist: true });
  try {
    if (db.pragma("integrity_check", { simple: true }) !== "ok") {
      throw new Error("A cópia do banco não passou na verificação de integridade.");
    }
    return {
      produtos: db.prepare('SELECT count(*) AS total FROM "Produto"').get().total,
      administradores: db.prepare('SELECT count(*) AS total FROM "Admin"').get().total,
    };
  } finally {
    db.close();
  }
}

async function digest(file) {
  return createHash("sha256").update(await readFile(file)).digest("hex");
}

export async function createBackup(source, backupRoot) {
  // A API de backup do SQLite inclui dados confirmados que ainda estão no WAL.
  const db = new Database(source, { readonly: true, fileMustExist: true });
  try {
    await mkdir(backupRoot, { recursive: true, mode: 0o700 });
    const directory = await mkdtemp(path.join(backupRoot, "guia-tech-"));
    const databaseFile = path.join(directory, "catalogo.db");
    await db.backup(databaseFile);
    const summary = inspect(databaseFile);
    const manifest = {
      version: 1,
      createdAt: new Date().toISOString(),
      sha256: await digest(databaseFile),
      ...summary,
    };
    await writeFile(path.join(directory, "manifesto.json"), JSON.stringify(manifest, null, 2) + "\n", { flag: "wx", mode: 0o600 });
    return { databaseFile, ...manifest };
  } finally {
    db.close();
  }
}

export async function verifyBackup(databaseFile) {
  const manifest = JSON.parse(await readFile(path.join(path.dirname(databaseFile), "manifesto.json"), "utf8"));
  if (manifest.version !== 1 || manifest.sha256 !== await digest(databaseFile)) {
    throw new Error("O arquivo difere da cópia verificada. Crie um novo backup antes de continuar.");
  }
  const summary = inspect(databaseFile);
  if (summary.produtos !== manifest.produtos || summary.administradores !== manifest.administradores) {
    throw new Error("A contagem da cópia difere do manifesto.");
  }
  return { databaseFile, ...manifest };
}
