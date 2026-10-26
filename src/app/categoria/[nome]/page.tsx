import CategoryHero from "@/components/CategoryHero";
import styles from "@/components/CategoryDesign.module.css";
import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { descricaoDaCategoria } from "@/lib/category-description";

import CatalogProducts from "@/components/CatalogProducts";
import CategoryComparison from "@/components/CategoryComparison";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

import prisma from "@/lib/prisma";
import { safeJsonLd } from "@/lib/product-schema";
import { SITE_URL } from "@/lib/site";

type Props = {
  params: Promise<{
    nome: string;
  }>;
};

const carregarCategoria = cache(async (categoria: string) =>
  prisma.produto.findMany({
    where: { categoria },
    orderBy: [{ criadoEm: "desc" }, { id: "desc" }],
    select: {
      id: true,
      nome: true,
      marca: true,
      categoria: true,
      preco: true,
      imagem: true,
      fichaTecnica: true,
    },
  })
);

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { nome } = await params;

  const categoria = decodeURIComponent(nome);

  const produtos = await carregarCategoria(categoria);
  const quantidade = produtos.length;

  const description = descricaoDaCategoria(categoria, quantidade);

  const canonical = `/categoria/${encodeURIComponent(categoria)}`;

  return {
    alternates: {
      canonical,
    },

    robots:
      quantidade > 0
        ? {
            index: true,
            follow: true,
          }
        : {
            index: false,
            follow: true,
          },

    title: categoria,
    description,

    openGraph: {
      url: canonical,
      siteName: "Guia Tech",
      locale: "pt_BR",
      title: `${categoria} | Guia Tech`,
      description,
      type: "website",
    },
  };
}

export default async function CategoriaPage({
  params,
}: Props) {
  const { nome } = await params;

  const categoria = decodeURIComponent(nome);

  const produtos = await carregarCategoria(categoria);

  const quantidade = produtos.length;

  const descricao = descricaoDaCategoria(categoria, quantidade);

  const categoriaUrl = `${SITE_URL}/categoria/${encodeURIComponent(
    categoria
  )}`;

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
        name: categoria,
        item: categoriaUrl,
      },
    ],
  };

  const itemListSchema =
    quantidade > 0
      ? {
          "@context": "https://schema.org",

          "@type": "ItemList",

          name: `${categoria} no Guia Tech`,

          numberOfItems: quantidade,

          itemListElement: produtos.map((produto, index) => ({
            "@type": "ListItem",

            position: index + 1,

            url: `${SITE_URL}/produtos/${produto.id}`,

            name: produto.nome,
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(breadcrumbSchema),
        }}
      />

      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(itemListSchema),
          }}
        />
      )}

      <Header />

      <main className={styles.page}>
        <CategoryHero categoria={categoria} quantidade={quantidade} descricao={descricao} />

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <CategoryComparison categoria={categoria} produtos={produtos} />
          {quantidade === 0 ? (
            <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />

                  <polyline points="3.29 7 12 12 20.71 7" />

                  <line
                    x1="12"
                    y1="22"
                    x2="12"
                    y2="12"
                  />
                </svg>
              </div>

              <h2 className="mt-5 text-2xl font-bold text-slate-900">
                Nenhum produto por aqui ainda
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                Estamos preparando novas recomendações para esta categoria.
                Enquanto isso, você pode explorar outras áreas do Guia Tech.
              </p>

              <Link
                href="/"
                className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Voltar para a página inicial
              </Link>
            </div>
          ) : (
            <CatalogProducts mostrarQuantidade={false}
              key={categoria}
              produtos={produtos.map(
                ({
                  id,
                  nome,
                  marca,
                  categoria,
                  preco,
                  imagem,
                }) => ({
                  id,
                  nome,
                  marca,
                  categoria,
                  preco,
                  imagem,
                })
              )}
            />
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
