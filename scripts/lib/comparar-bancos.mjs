import { isDeepStrictEqual } from "node:util";

async function retrato(prisma) {
  const produtos = await prisma.produto.findMany({ orderBy: { id: "asc" } });
  const administradores = await prisma.admin.findMany({ orderBy: { id: "asc" } });
  const sequencias = await prisma.$queryRaw`SELECT name, seq FROM sqlite_sequence WHERE name IN ('Produto', 'Admin') ORDER BY name`;
  return {
    produtos,
    administradores,
    sequencias: sequencias.map(({ name, seq }) => ({ name, seq: Number(seq) })),
  };
}

export async function compararBancos(local, destino) {
  const [origem, copia] = await Promise.all([retrato(local), retrato(destino)]);
  for (const campo of ["produtos", "administradores", "sequencias"]) {
    if (!isDeepStrictEqual(origem[campo], copia[campo])) {
      // Nunca incluir os registros comparados: administradores contêm dados de acesso.
      throw new Error(`A conferência encontrou diferença em ${campo}. A migração não está validada.`);
    }
  }
  return { produtos: origem.produtos.length, administradores: origem.administradores.length, campos: "iguais", sequencias: "iguais" };
}
