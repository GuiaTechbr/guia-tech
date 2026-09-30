import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaLibSql } from "@prisma/adapter-libsql/web";
import { obterConfigBanco } from "@/lib/database-config";

const config = obterConfigBanco();
// Sem fallback automático: falhas do banco online nunca abrem uma cópia local antiga.
const adapter = config.modo === "turso"
  ? new PrismaLibSql({ url: config.url, authToken: config.authToken, tls: true })
  : new PrismaBetterSqlite3({
      url: path.join(process.cwd(), "prisma", "dev.db"),
      readonly: !config.permiteGravacao,
      fileMustExist: true,
    });

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
export default prisma;
