import type { Metadata } from "next";
import Link from "next/link";
import HomeHero from "@/components/HomeHero";
import HomeHighlights from "@/components/HomeHighlights";

import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import Categories from "@/components/Categories";
import FeaturedProducts from "@/components/FeaturedProducts";
import Footer from "@/components/Footer";
import prisma from "@/lib/prisma";
import { caminhoCategoria } from "@/lib/appliances";

const secoes = [
  {
    categoria: "Casa Inteligente",
    titulo: "Casa Inteligente",
    descricao: "Explore automação, segurança e dispositivos conectados para sua casa.",
  },
  {
    categoria: "Wearables",
    titulo: "Wearables",
    descricao: "Compare relógios e pulseiras para acompanhar sua rotina.",
  },
  {
    categoria: "TV e Streaming",
    titulo: "TV e Streaming",
    descricao: "Conheça equipamentos de áudio e streaming para seu entretenimento.",
  },
  {
    categoria: "Acessórios",
    titulo: "Acessórios",
    descricao: "Encontre fones, cases e complementos para seus dispositivos.",
  },
  {
    categoria: "Eletrodomésticos",
    titulo: "Eletrodomésticos",
    descricao: "Compare soluções para a cozinha, a limpeza e o cuidado com a casa.",
  },
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
  {
    categoria: "Smart TV",
    titulo: "Smart TVs",
    descricao: "Compare telas, recursos e tamanhos para escolher sua próxima TV.",
  },
  {
    categoria: "Games",
    titulo: "Games",
    descricao: "Explore jogos, consoles e componentes para seu setup.",
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
  const grupos = await Promise.all(
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
  );

  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50">
        <HomeHero />

        <HomeHighlights />

        <Categories />

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
                    href={caminhoCategoria(grupo.categoria)}
                    className="w-fit rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Ver todos em {grupo.titulo} →
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
