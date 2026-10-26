import type { MetadataRoute } from "next";
import { caminhoCategoria } from "@/lib/appliances";
import prisma from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const produtos = await prisma.produto.findMany({ select: { id: true, categoria: true } });
  const categorias = Array.from(new Set(produtos.map((produto) => produto.categoria))).filter(Boolean);
  return [
    { url: SITE_URL + "/" },
    { url: SITE_URL + "/ofertas" },
    ...categorias.map((categoria) => ({ url: SITE_URL + caminhoCategoria(categoria) })),
    ...produtos.map((produto) => ({ url: SITE_URL + "/produtos/" + produto.id })),
  ];
}
