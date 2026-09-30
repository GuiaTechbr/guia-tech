import path from "node:path";
import { createBackup, verifyBackup } from "./lib/backup.mjs";

try {
  const args = process.argv.slice(2);
  if (args.length && (args[0] !== "--verificar" || args.length !== 2)) {
    throw new Error("Use npm run banco:backup ou npm run banco:backup -- --verificar CAMINHO_DO_BACKUP.");
  }
  const result = args[0] === "--verificar"
    ? await verifyBackup(path.resolve(args[1]))
    : await createBackup(path.resolve("prisma/dev.db"), path.resolve("backups"));
  console.log(`Cópia verificada: ${result.databaseFile}`);
  console.log(`Produtos: ${result.produtos}; administradores: ${result.administradores}.`);
  console.log("Esta cópia contém dados de acesso. Guarde-a fora do GitHub e não a compartilhe.");
} catch (error) {
  console.error(error instanceof Error ? error.message : "Não foi possível verificar a cópia.");
  process.exitCode = 1;
}
