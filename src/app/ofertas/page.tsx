import type { Metadata } from "next";
import Link from "next/link";

import CatalogProducts from "@/components/CatalogProducts";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

import prisma from "@/lib/prisma";
import { safeJsonLd } from "@/lib/product-schema";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Ofertas de tecnologia",

  description:
    "Explore ofertas de tecnologia, compare produtos e filtre opções por categoria, marca e preço para encontrar a melhor escolha para você.",

  alternates: {
    canonical: "/ofertas",
  },

  openGraph: {
    title: "Ofertas de tecnologia | Guia Tech",
    description:
      "Explore ofertas de tecnologia, compare produtos e filtre opções por categoria, marca e preço no Guia Tech.",
    url: "/ofertas",
    siteName: "Guia Tech",
    locale: "pt_BR",
    type: "website",
  },
};

export default async function OfertasPage() {
  const produtos = await prisma.produto.findMany({
    orderBy: [
      {
        criadoEm: "desc",
      },
      {
        id: "desc",
      },
    ],

    select: {
      id: true,
      nome: true,
      marca: true,
      categoria: true,
      preco: true,
      imagem: true,
    },
  });

  const ofertasUrl = `${SITE_URL}/ofertas`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",

    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Guia Tech",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Ofertas",
        item: ofertasUrl,
      },
    ],
  };

  const itemListSchema =
    produtos.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",

          name: "Ofertas de tecnologia no Guia Tech",

          numberOfItems: produtos.length,

          itemListElement: produtos.map(
            (produto, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: `${SITE_URL}/produtos/${produto.id}`,
              name: produto.nome,
            })
          ),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(
            breadcrumbSchema
          ),
        }}
      />

      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(
              itemListSchema
            ),
          }}
        />
      )}

      <Header />

      <main className="min-h-screen bg-slate-50">
        <section className="border-b border-blue-100 bg-gradient-to-br from-blue-50 via-white to-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-2 text-sm"
            >
              <Link
                href="/"
                className="font-medium text-slate-500 transition-colors hover:text-blue-600"
              >
                Início
              </Link>

              <span
                aria-hidden="true"
                className="text-slate-300"
              >
                ›
              </span>

              <span
                aria-current="page"
                className="font-semibold text-slate-700"
              >
                Ofertas
              </span>
            </nav>

            <div className="mt-7 max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                Ofertas selecionadas
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Encontre boas opções em tecnologia
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Explore produtos, compare modelos e
                filtre opções por categoria, marca e
                preço para encontrar a tecnologia que
                melhor combina com você.
              </p>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
                Os preços e a disponibilidade podem
                mudar. Confira sempre as condições
                atualizadas diretamente na loja
                parceira antes de comprar.
              </p>

              {produtos.length > 0 && (
                <p className="mt-4 text-sm font-medium text-slate-500">
                  {produtos.length}{" "}
                  {produtos.length === 1
                    ? "produto disponível"
                    : "produtos disponíveis"}
                </p>
              )}

              <Link
                href="#produtos"
                className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Explorar produtos ↓
              </Link>
            </div>
          </div>
        </section>

        <section
          id="produtos"
          aria-label="Catálogo de ofertas"
          className="mx-auto max-w-7xl scroll-mt-6 px-4 py-10 sm:px-6 lg:px-8"
        >
          {produtos.length > 0 ? (
            <CatalogProducts
              produtos={produtos}
              filtrarCategoria
            />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                Nenhuma oferta disponível no momento
              </h2>

              <p className="mt-3 text-slate-600">
                Novos produtos serão adicionados em
                breve.
              </p>

              <Link
                href="/"
                className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Voltar para o início
              </Link>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}