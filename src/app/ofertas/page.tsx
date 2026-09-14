import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import CatalogProducts from "@/components/CatalogProducts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Ofertas de tecnologia",
  description: "Explore ofertas de tecnologia e filtre produtos por categoria, marca e orçamento no Guia Tech.",
  alternates: { canonical: "/ofertas" },
  openGraph: { title: "Ofertas de tecnologia", description: "Explore ofertas de tecnologia e filtre produtos por categoria, marca e orçamento no Guia Tech.", url: "/ofertas", siteName: "Guia Tech", locale: "pt_BR", type: "website" },
};

export default async function OfertasPage() {
  const produtos = await prisma.produto.findMany({
    orderBy: [{ criadoEm: "desc" }, { id: "desc" }],
    select: { id: true, nome: true, marca: true, categoria: true, preco: true, imagem: true },
  });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50">
        <section className="border-b border-blue-100 bg-gradient-to-br from-blue-50 via-white to-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <Link href="/" className="text-sm font-semibold text-blue-700 hover:underline">← Voltar para o início</Link>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">Ofertas selecionadas</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Encontre produtos por categoria e marca. Ordene pelo preço para explorar as opções que combinam com seu orçamento.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
              Os preços podem mudar. Confira o valor e a disponibilidade na loja parceira antes de comprar.
            </p>
            <Link href="#produtos" className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Explorar produtos ↓</Link>
          </div>
        </section>
        <section id="produtos" aria-label="Catálogo de ofertas" className="mx-auto max-w-7xl scroll-mt-6 px-4 py-10 sm:px-6 lg:px-8">
          {produtos.length > 0 ? <CatalogProducts produtos={produtos} filtrarCategoria /> : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <h2 className="text-xl font-bold text-slate-900">Nenhuma oferta disponível no momento</h2>
              <p className="mt-3 text-slate-600">Novos produtos serão adicionados em breve.</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
