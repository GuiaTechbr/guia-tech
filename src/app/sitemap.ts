import type { MetadataRoute } from "next";
import { caminhoCategoria } from "@/lib/appliances";
import prisma from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";
import { ACCESSORIES, accessoryGroup, accessoryGroups, accessoryPath } from "@/lib/accessories";

export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const produtos = await prisma.produto.findMany({
    orderBy: { id: "asc" },
    select: { id: true, categoria: true },
  });
  const acessorios = await prisma.produto.findMany({
    where: { categoria: ACCESSORIES },
    select: { nome: true, categoria: true, fichaTecnica: true },
  });
  const categorias = Array.from(new Set(produtos.map((produto) => produto.categoria))).filter(Boolean);
  const grupos = new Set(acessorios.map(accessoryGroup));
  return [
    { url: SITE_URL + "/" },
    { url: SITE_URL + "/ofertas" },
    ...categorias.map((categoria) => ({ url: SITE_URL + caminhoCategoria(categoria) })),
    ...accessoryGroups.filter(({ slug }) => grupos.has(slug)).map(({ slug }) => ({
      url: SITE_URL + accessoryPath(slug),
    })),
    ...produtos.map((produto) => ({ url: SITE_URL + "/produtos/" + produto.id })),
  ];
}
