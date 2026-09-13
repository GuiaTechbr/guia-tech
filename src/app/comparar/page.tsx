import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductComparison from "@/components/ProductComparison";
import prisma from "@/lib/prisma";

export const metadata: Metadata = { title: "Comparar produtos", robots: { index: false, follow: true } };
export default async function CompararPage({ searchParams }: { searchParams: Promise<{ ids?: string | string[] }> }) {
  const parametros = await searchParams;
  const produtos = await prisma.produto.findMany({
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, marca: true, categoria: true, preco: true, fichaTecnica: true, pontosPositivos: true, pontosAtencao: true },
  });
  const initialIds = Array.from(new Set((typeof parametros.ids === "string" ? parametros.ids : "").split(",").map(Number)))
    .filter((id) => Number.isSafeInteger(id) && id > 0 && produtos.some((produto) => produto.id === id)).slice(0, 3);
  return <>
    <Header />
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Compare antes de escolher</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">Veja até três produtos lado a lado e confira as diferenças que fazem sentido para você.</p>
        <div className="mt-8"><ProductComparison key={initialIds.join(",")} produtos={produtos} initialIds={initialIds} /></div>
      </div>
    </main>
    <Footer />
  </>;
}
