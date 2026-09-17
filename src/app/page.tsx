import type { Metadata } from "next";
import Link from "next/link";
import { GitCompareArrows } from "lucide-react";

import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import Categories from "@/components/Categories";
import FeaturedProducts from "@/components/FeaturedProducts";
import Footer from "@/components/Footer";
import prisma from "@/lib/prisma";

const secoes = [
  {
    categoria: "Smartphone",
    titulo: "Smartphones",
    descricao:
      "Conheça os recursos e encontre o modelo que combina com você.",
  },
  {
    categoria: "Notebook",
    titulo: "Notebooks",
    descricao:
      "Explore opções para trabalhar, estudar e se divertir.",
  },
];

export const metadata: Metadata = {
  title: { absolute: "Guia Tech | Produtos, ofertas e comparações" },
  description:
    "Explore produtos de tecnologia, confira características e compare opções para escolher melhor.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Guia Tech | Produtos, ofertas e comparações",
    description:
      "Explore produtos de tecnologia, confira características e compare opções para escolher melhor.",
    url: "/",
    siteName: "Guia Tech",
    locale: "pt_BR",
    type: "website",
  },
};

export default async function Home() {
  const [contagens, grupos] = await Promise.all([
    prisma.produto.groupBy({
      by: ["categoria"],
      _count: {
        _all: true,
      },
    }),

    Promise.all(
      secoes.map(async (secao) => ({
        ...secao,

        produtos: await prisma.produto.findMany({
          where: {
            categoria: secao.categoria,
          },

          take: 3,

          orderBy: [
            {
              criadoEm: "desc",
            },
            {
              id: "desc",
            },
          ],
        }),
      }))
    ),
  ]);

  const quantidades = Object.fromEntries(
    contagens.map((item) => [
      item.categoria,
      item._count._all,
    ])
  );

  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50">
        <section className="border-b border-blue-100 bg-gradient-to-br from-blue-50 via-white to-slate-100 px-4 py-6 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-5xl text-center">
            <span className="inline-flex rounded-full border border-blue-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-700">
              Seu guia de tecnologia
            </span>

            <h1 className="mx-auto mt-3 max-w-4xl text-3xl font-bold tracking-tight text-slate-950 sm:mt-5 sm:text-5xl lg:text-6xl">
              Encontre a tecnologia certa para você.
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:mt-5 sm:text-lg sm:leading-7">
              Explore produtos, compare especificações, confira os
              pontos positivos e de atenção e veja as ofertas nas
              lojas parceiras.
            </p>

            <div className="mt-5 flex flex-col justify-center gap-2 sm:mt-7 sm:flex-row sm:flex-wrap sm:gap-3">
              <Link
                href="#destaques"
                className="rounded-xl bg-blue-600 px-6 py-2.5 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:py-3"
              >
                Conhecer os destaques ↓
              </Link>

              <Link
                href="/comparar"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-300 bg-white px-6 py-2.5 font-semibold text-blue-700 shadow-sm transition hover:border-blue-500 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:py-3"
              >
                <GitCompareArrows
                  aria-hidden="true"
                  size={19}
                />

                Comparar produtos
              </Link>

              <Link
                href="#categorias"
                className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:py-3"
              >
                Explorar categorias
              </Link>
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500 sm:mt-5 sm:text-sm">
              Informações do produto em um só lugar. Compare até
              3 modelos e compre diretamente na loja parceira.
            </p>
          </div>
        </section>

        <Categories quantidades={quantidades} />

        <FeaturedProducts />

        {grupos
          .filter(
            (grupo) => grupo.produtos.length > 0
          )
          .map((grupo) => (
            <section
              key={grupo.categoria}
              className="border-t border-slate-200 bg-white px-4 py-10 sm:px-6 sm:py-12 lg:px-8"
            >
              <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      {grupo.titulo}
                    </h2>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                      {grupo.descricao}
                    </p>
                  </div>

                  <Link
                    href={`/categoria/${encodeURIComponent(
                      grupo.categoria
                    )}`}
                    className="w-fit rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Ver todos (
                    {quantidades[
                      grupo.categoria
                    ] ?? 0}
                    ) →
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
                  {grupo.produtos.map(
                    (produto) => (
                      <ProductCard
                        key={produto.id}
                        produto={produto}
                        layout="grid"
                      />
                    )
                  )}
                </div>
              </div>
            </section>
          ))}
      </main>

      <Footer />
    </>
  );
}