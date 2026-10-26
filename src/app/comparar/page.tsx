import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductComparison from "@/components/ProductComparison";
import styles from "@/components/ProductComparison.module.css";
import { camposComparacao } from "@/lib/comparison-products";
import prisma from "@/lib/prisma";

export const metadata: Metadata = { title: "Comparar produtos", robots: { index: false, follow: true } };
export default async function CompararPage({ searchParams }: { searchParams: Promise<{ ids?: string | string[]; categoria?: string | string[] }> }) {
  const parametros = await searchParams;
  const produtos = await prisma.produto.findMany({
    orderBy: { nome: "asc" }, select: { id: true, nome: true, marca: true, categoria: true },
  });
  const porId = new Map(produtos.map(produto => [produto.id, produto]));
  const initialIds = Array.from(new Set((typeof parametros.ids === "string" ? parametros.ids : "").split(",").map(Number)))
    .filter(id => Number.isSafeInteger(id) && id > 0 && porId.has(id)).slice(0, 3);
  const initialProdutos = initialIds.length ? await prisma.produto.findMany({
    where: { id: { in: initialIds } }, select: camposComparacao,
  }) : [];
  const categorias = new Set(initialProdutos.map(produto => produto.categoria));
  const categoriaSolicitada = typeof parametros.categoria === "string" && produtos.some(produto => produto.categoria === parametros.categoria) ? parametros.categoria : undefined;
  const categoriaContexto = categoriaSolicitada ?? (categorias.size === 1 ? initialProdutos[0].categoria : undefined);
  return <>
    <Header />
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.pageTitle}>Compare antes de escolher</h1>
        <p className={styles.pageDescription}>Veja até três produtos lado a lado e confira as diferenças que fazem sentido para você.</p>
        <ProductComparison key={initialIds.join(",")} produtos={produtos} initialIds={initialIds} initialProdutos={initialProdutos} categoriaContexto={categoriaContexto} />
      </div>
    </main>
    <Footer />
  </>;
}

