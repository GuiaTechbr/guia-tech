import type { Metadata } from "next";
import Link from "next/link";

import CatalogProducts from "@/components/CatalogProducts";
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

const descricoesCategoria: Record<string, string> = {
  Smartphone:
    "Compare smartphones, confira especificações, pontos positivos, pontos de atenção e ofertas selecionadas para encontrar o celular ideal para você.",

  Notebook:
    "Compare notebooks para trabalho, estudos e uso pessoal, confira especificações, pontos positivos, pontos de atenção e ofertas selecionadas.",
};

function descricaoDaCategoria(
  categoria: string,
  quantidade: number
) {
  const personalizada =
    descricoesCategoria[categoria];

  if (personalizada) {
    return personalizada;
  }

  if (quantidade > 0) {
    return `Explore ${quantidade} ${
      quantidade === 1
        ? "produto selecionado"
        : "produtos selecionados"
    } na categoria ${categoria}. Compare informações, características e ofertas no Guia Tech.`;
  }

  return `Explore a categoria ${categoria} no Guia Tech e acompanhe novas recomendações, comparações e ofertas.`;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { nome } = await params;

  const categoria = nome;

  const quantidade =
    await prisma.produto.count({
      where: {
        categoria,
      },
    });

  const description =
    descricaoDaCategoria(
      categoria,
      quantidade
    );

  const canonical =
    `/categoria/${encodeURIComponent(
      categoria
    )}`;

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

  const categoria = nome;

  const produtos =
    await prisma.produto.findMany({
      where: {
        categoria,
      },

      orderBy: [
        {
          criadoEm: "desc",
        },
        {
          id: "desc",
        },
      ],
    });

  const quantidade = produtos.length;

  const descricao =
    descricaoDaCategoria(
      categoria,
      quantidade
    );

  const categoriaUrl =
    `${SITE_URL}/categoria/${encodeURIComponent(
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
          "@context":
            "https://schema.org",

          "@type": "ItemList",

          name: `${categoria} no Guia Tech`,

          numberOfItems:
            quantidade,

          itemListElement:
            produtos.map(
              (produto, index) => ({
                "@type":
                  "ListItem",

                position:
                  index + 1,

                url:
                  `${SITE_URL}/produtos/${produto.id}`,

                name:
                  produto.nome,
              })
            ),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            safeJsonLd(
              breadcrumbSchema
            ),
        }}
      />

      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              safeJsonLd(
                itemListSchema
              ),
          }}
        />
      )}

      <Header />

      <main className="min-h-screen bg-slate-50">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
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
                {categoria}
              </span>
            </nav>

            <div className="mt-7 max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                Categoria
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                {categoria}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                {quantidade === 0
                  ? "Ainda não há produtos cadastrados nesta categoria. Novas seleções serão adicionadas em breve."
                  : descricao}
              </p>

              {quantidade > 0 && (
                <p className="mt-3 text-sm font-medium text-slate-500">
                  {quantidade}{" "}
                  {quantidade === 1
                    ? "produto disponível"
                    : "produtos disponíveis"}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
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
                Estamos preparando novas
                recomendações para esta categoria.
                Enquanto isso, você pode explorar
                outras áreas do Guia Tech.
              </p>

              <Link
                href="/"
                className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Voltar para a página inicial
              </Link>
            </div>
          ) : (
            <CatalogProducts
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