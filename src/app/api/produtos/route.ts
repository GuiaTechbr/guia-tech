import prisma from "@/lib/prisma";

export async function GET() {
  const produtos = await prisma.produto.findMany();

  return Response.json(produtos);
}