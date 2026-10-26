import prisma from "@/lib/prisma";
import { camposComparacao } from "@/lib/comparison-products";

export async function GET(request: Request) {
  const partes = new URL(request.url).searchParams.get("ids")?.split(",") ?? [];
  if (!partes.length || partes.length > 3 || partes.some(id => !/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id)))) {
    return Response.json({ erro: "Informe de um a três produtos válidos." }, { status: 400 });
  }
  try {
    const produtos = await prisma.produto.findMany({
      where: { id: { in: [...new Set(partes.map(Number))] } }, select: camposComparacao,
    });
    return Response.json(produtos, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ erro: "Não foi possível carregar os produtos. Tente novamente." }, { status: 503 });
  }
}
