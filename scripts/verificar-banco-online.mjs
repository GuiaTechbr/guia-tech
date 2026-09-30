import path from "node:path";
import nextEnv from "@next/env";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaLibSql } from "@prisma/adapter-libsql/web";
import { obterConfigBanco } from "../src/lib/database-config.ts";
import { verifyBackup } from "./lib/backup.mjs";
import { compararBancos } from "./lib/comparar-bancos.mjs";

const { loadEnvConfig } = nextEnv;
let local;
let remoto;
let etapa = "argumentos";
const deadline = setTimeout(() => {
  console.error("A conferência excedeu 45 segundos. Nenhuma gravação foi solicitada; confira a conexão e tente novamente.");
  process.exit(1);
}, 45000);
deadline.unref();

try {
  const args = process.argv.slice(2);
  if (args.length !== 1) throw new Error("Argumentos inválidos.");

  etapa = "configuração privada";
  loadEnvConfig(process.cwd(), false, { info() {}, error() {} });
  const config = obterConfigBanco();
  if (config.modo !== "turso") throw new Error("Banco online não configurado.");

  etapa = "backup local e manifesto";
  const backup = await verifyBackup(path.resolve(args[0]));
  local = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: backup.databaseFile, readonly: true, fileMustExist: true }) });

  etapa = "acesso ou conteúdo do banco online";
  remoto = new PrismaClient({ adapter: new PrismaLibSql({ url: config.url, authToken: config.authToken, tls: true }) });
  const resultado = await compararBancos(local, remoto);
  console.log(JSON.stringify(resultado));
  console.log("Conteúdo conferido sem gravações. A ativação, os testes de login/escrita e a publicação continuam sendo etapas separadas.");
} catch {
  // Exibe apenas o nome da etapa; erros do cliente podem incluir URL, SQL e credenciais.
  if (etapa === "argumentos") {
    console.error("Uso: npm run banco:verificar-online -- CAMINHO_DO_BACKUP/catalogo.db");
  } else {
    console.error(`Conferência não aprovada na etapa: ${etapa}. Confira essa etapa antes de continuar. Nenhuma gravação foi solicitada.`);
  }
  process.exitCode = 1;
} finally {
  await Promise.allSettled([local?.$disconnect(), remoto?.$disconnect()]);
  clearTimeout(deadline);
}
