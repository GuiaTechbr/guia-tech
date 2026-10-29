import { APPLIANCES, caminhoCategoria } from "@/lib/appliances";
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
import { notFound } from "next/navigation";
import AccessoryNavigation from "@/components/AccessoryNavigation";
import { ACCESSORIES, accessoryGroups, accessoryPath, selectAccessories } from "@/lib/accessories";

type Props = {
  searchParams?: Promise<{ subcategoria?: string | string[] }>;
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
  searchParams,
}: Props): Promise<Metadata> {
  const { nome } = await params;

  const categoria = decodeURIComponent(nome);

  const query = (await searchParams) ?? {};
  const group = categoria === ACCESSORIES && typeof query.subcategoria === "string"
    ? accessoryGroups.find(g => g.slug === query.subcategoria) : undefined;
  const todos = await carregarCategoria(categoria);
  const produtos = group ? selectAccessories(todos, group.slug) : todos;
  const quantidade = produtos.length;

  const description = group ? `Explore ${group.nome.toLowerCase()} no Guia Tech. Compare modelos e filtre por marca e preço.` : descricaoDaCategoria(categoria, quantidade);

  const canonical = group ? accessoryPath(group.slug) : caminhoCategoria(categoria);

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

    title: group ? `${group.nome} | Acessórios` : categoria,
    description,

    openGraph: {
      url: canonical,
      siteName: "Guia Tech",
      locale: "pt_BR",
      title: `${group?.nome ?? categoria} | Guia Tech`,
      description,
      type: "website",
    },
  };
}

export default async function CategoriaPage({
  params,
  searchParams,
}: Props) {
  const { nome } = await params;

  const categoria = decodeURIComponent(nome);

  const query = (await searchParams) ?? {};
  const slug = categoria === ACCESSORIES ? query.subcategoria ?? "" : "";
  const group = accessoryGroups.find(g => g.slug === slug);
  if (slug && !group) notFound();
  const todos = await carregarCategoria(categoria);
  const produtos = group ? selectAccessories(todos, group.slug) : todos;

  const quantidade = produtos.length;

  const descricao = descricaoDaCategoria(categoria, quantidade);

  const categoriaUrl = SITE_URL + caminhoCategoria(categoria);

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
      ...(group ? [{ "@type": "ListItem", position: 3, name: group.nome, item: SITE_URL + accessoryPath(group.slug) }] : []),
    ],
  };

  const itemListSchema =
    quantidade > 0
      ? {
          "@context": "https://schema.org",

          "@type": "ItemList",

          name: `${group?.nome ?? categoria} no Guia Tech`,

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
          {categoria === ACCESSORIES && <AccessoryNavigation produtos={todos} selecionada={group?.slug ?? ""} />}
          {categoria === ACCESSORIES && <div id="catalogo-acessorios" className="mb-6 scroll-mt-6">
            <h2 className="text-2xl font-bold text-slate-900">{group?.nome ?? "Todos os acessórios"}</h2>
            <p className="mt-2 text-sm text-slate-600">{quantidade} produto(s) disponíveis nesta seleção.</p>
          </div>}
          <CategoryComparison categoria={categoria} produtos={produtos} />
          {categoria === APPLIANCES ? <CatalogProducts produtos={produtos} eletrodomesticos /> : quantidade === 0 ? (
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
            <CatalogProducts mostrarQuantidade={categoria === ACCESSORIES}
              key={`${categoria}:${group?.slug ?? ""}`}
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
