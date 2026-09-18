import {
  breadcrumbSchema,
  productSchema,
  safeJsonLd,
} from "@/lib/product-schema";

import { cache } from "react";
import { notFound } from "next/navigation";
import { parseProductId } from "@/lib/product-id";
import ShareProduct from "@/components/ShareProduct";
import FavoriteButton from "@/components/FavoriteButton";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const carregarProduto = cache(async (codigo: string) => {
  const id = parseProductId(codigo);

  if (id === null) {
    notFound();
  }

  const produto = await prisma.produto.findUnique({
    where: {
      id,
    },
  });

  if (!produto) {
    notFound();
  }

  return produto;
});

function transformarEmLista(texto: string | null) {
  if (!texto) {
    return [];
  }

  return texto
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean);
}

function obterYoutubeId(url: string | null) {
  if (!url) {
    return null;
  }

  try {
    const endereco = new URL(url.trim());
    const host = endereco.hostname
      .replace(/^www\./, "")
      .toLowerCase();

    let videoId: string | null = null;

    if (host === "youtu.be") {
      videoId =
        endereco.pathname.split("/").filter(Boolean)[0] ||
        null;
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com"
    ) {
      if (endereco.pathname === "/watch") {
        videoId = endereco.searchParams.get("v");
      } else {
        const partes = endereco.pathname
          .split("/")
          .filter(Boolean);

        if (
          ["embed", "shorts", "live"].includes(partes[0])
        ) {
          videoId = partes[1] || null;
        }
      }
    }

    if (
      videoId &&
      /^[A-Za-z0-9_-]{11}$/.test(videoId)
    ) {
      return videoId;
    }
  } catch {
    return null;
  }

  return null;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { id } = await params;

  const produto = await carregarProduto(id);

  const descricao =
    produto.descricao?.slice(0, 155) ||
    `Confira ${produto.nome} no Guia Tech, com informações, preço e oferta disponível.`;

  return {
    alternates: {
      canonical: `/produtos/${produto.id}`,
    },

    title: produto.nome,

    description: descricao,

    openGraph: {
      url: `/produtos/${produto.id}`,
      siteName: "Guia Tech",
      locale: "pt_BR",
      title: produto.nome,
      description: descricao,
      type: "website",

      images: produto.imagem
        ? [
            {
              url: produto.imagem,
              alt: produto.nome,
            },
          ]
        : undefined,
    },
  };
}

export default async function ProdutoPage({
  params,
}: Props) {
  const { id } = await params;

  const produto = await carregarProduto(id);

  const youtubeId = obterYoutubeId(
    produto.videoOficial
  );

  const produtosRelacionados =
    await prisma.produto.findMany({
      where: {
        categoria: produto.categoria,
        id: {
          not: produto.id,
        },
      },

      orderBy: [
        {
          criadoEm: "desc",
        },
        {
          id: "desc",
        },
      ],

      take: 3,

      select: {
        id: true,
        nome: true,
        marca: true,
        imagem: true,
        preco: true,
      },
    });

  const destaques = transformarEmLista(
    produto.destaques
  );

  const fichaTecnica = transformarEmLista(
    produto.fichaTecnica
  );

  const pontosPositivos = transformarEmLista(
    produto.pontosPositivos
  );

  const pontosAtencao = transformarEmLista(
    produto.pontosAtencao
  );

  const possuiConteudoExtra =
    destaques.length > 0 ||
    fichaTecnica.length > 0 ||
    pontosPositivos.length > 0 ||
    pontosAtencao.length > 0;

  return (
    <div
      className={
        produto.linkAfiliado
          ? "pb-36 lg:pb-0"
          : ""
      }
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(
            productSchema(produto)
          ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(
            breadcrumbSchema(produto)
          ),
        }}
      />

      <Header />

      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <Link
            href={`/categoria/${encodeURIComponent(
              produto.categoria
            )}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
          >
            <span aria-hidden="true">←</span>

            Voltar para {produto.categoria}
          </Link>

          <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="grid lg:grid-cols-2">
              <div className="flex min-h-[280px] items-center justify-center border-b border-slate-200 bg-slate-50 p-6 sm:min-h-[420px] sm:p-10 lg:border-b-0 lg:border-r">
                {produto.imagem ? (
                  <Image
                    src={produto.imagem}
                    unoptimized
                    alt={produto.nome}
                    width={650}
                    height={650}
                    className="max-h-[280px] w-full object-contain transition-transform duration-300 hover:scale-[1.02] sm:max-h-[440px]"
                    sizes="(min-width: 1280px) 550px, (min-width: 1024px) 45vw, 90vw"
                    preload
                  />
                ) : (
                  <span className="text-sm text-slate-400">
                    Sem imagem disponível
                  </span>
                )}
              </div>

              <div className="flex flex-col p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {produto.categoria}
                  </span>

                  <span className="text-sm font-medium text-slate-500">
                    {produto.marca}
                  </span>
                </div>

                <h1 className="mt-5 break-words text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl">
                  {produto.nome}
                </h1>

                <div className="mt-4 max-w-md">
                  <FavoriteButton
                    id={produto.id}
                    nome={produto.nome}
                  />

                  <ShareProduct
                    key={produto.id}
                    id={produto.id}
                    nome={produto.nome}
                  />

                  <Link
                    href={`/comparar?ids=${produto.id}`}
                    className="mt-2 inline-flex py-2 text-sm font-semibold text-blue-700 hover:underline"
                  >
                    Comparar com outros produtos →
                  </Link>
                </div>

                <div
                  id="oferta"
                  className="mt-7 scroll-mt-6 border-y border-slate-100 py-6"
                >
                  <p className="text-sm font-medium text-slate-500">
                    Preço encontrado
                  </p>

                  {produto.preco !== null ? (
                    <p className="mt-1 text-3xl font-bold text-green-600 sm:text-4xl">
                      R${" "}
                      {produto.preco.toLocaleString(
                        "pt-BR",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </p>
                  ) : (
                    <p className="mt-1 text-lg font-semibold text-slate-600">
                      Consulte o preço na loja
                    </p>
                  )}

                  <div className="mt-2 space-y-1 text-xs leading-5 text-slate-400">
                    <p>
                      O preço pode sofrer alterações
                      na loja sem aviso prévio.
                    </p>

                    <p>
                      Cores e outras variações
                      disponíveis podem mudar
                      conforme a oferta da loja
                      parceira.
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  {produto.linkAfiliado ? (
                    <a
                      href={produto.linkAfiliado}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-center text-base font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[0_10px_25px_rgba(37,99,235,0.18)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:text-lg"
                    >
                      Ver oferta na Amazon
                      <span aria-hidden="true">
                        →
                      </span>
                    </a>
                  ) : (
                    <div className="rounded-xl bg-slate-100 px-6 py-4 text-center text-sm font-semibold text-slate-500">
                      Oferta indisponível no momento
                    </div>
                  )}
                </div>

                <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                  Ao clicar, você será direcionado
                  para a loja parceira. O Guia Tech
                  pode receber comissão pela compra,
                  sem custo adicional para você.
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m5 12 4 4L19 6" />
                      </svg>
                    </div>

                    <p className="mt-3 text-sm font-bold text-slate-800">
                      Oferta selecionada
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Produto selecionado pelo Guia
                      Tech.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M14 3h7v7" />
                        <path d="M10 14 21 3" />
                        <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
                      </svg>
                    </div>

                    <p className="mt-3 text-sm font-bold text-slate-800">
                      Compra externa
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      A compra é concluída diretamente
                      na loja.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      $
                    </div>

                    <p className="mt-3 text-sm font-bold text-slate-800">
                      Sem custo extra
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      A comissão não aumenta o preço
                      para você.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {youtubeId && (
            <section
              aria-labelledby="video-oficial"
              className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                  Vídeo oficial
                </p>

                <h2
                  id="video-oficial"
                  className="mt-2 scroll-mt-6 text-2xl font-bold text-slate-950"
                >
                  Veja o produto em ação
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Confira o vídeo oficial do fabricante para
                  conhecer melhor o produto.
                </p>
              </div>

              <div className="aspect-video overflow-hidden rounded-2xl bg-slate-950">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
                  title={`Vídeo oficial: ${produto.nome}`}
                  className="h-full w-full"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Vídeo oficial do fabricante.
              </p>
            </section>
          )}

          {(produto.descricao ||
            possuiConteudoExtra) && (
            <nav
              aria-label="Informações do produto"
              className="mt-6 flex flex-wrap gap-2"
            >
              {[
                {
                  id: "sobre-produto",
                  nome: "Sobre o produto",
                  mostrar: Boolean(
                    produto.descricao
                  ),
                },
                {
                  id: "destaques",
                  nome: "Destaques",
                  mostrar:
                    destaques.length > 0,
                },
                {
                  id: "ficha-tecnica",
                  nome: "Ficha técnica",
                  mostrar:
                    fichaTecnica.length > 0,
                },
                {
                  id: "pontos-positivos",
                  nome: "Pontos positivos",
                  mostrar:
                    pontosPositivos.length > 0,
                },
                {
                  id: "pontos-atencao",
                  nome: "Pontos de atenção",
                  mostrar:
                    pontosAtencao.length > 0,
                },
              ]
                .filter(
                  (secao) =>
                    secao.mostrar
                )
                .map((secao) => (
                  <a
                    key={secao.id}
                    href={`#${secao.id}`}
                    className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    {secao.nome}
                  </a>
                ))}
            </nav>
          )}

          {produto.descricao && (
            <section
              aria-labelledby="sobre-produto"
              className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <h2
                id="sobre-produto"
                className="scroll-mt-6 text-2xl font-bold text-slate-950"
              >
                Sobre este produto
              </h2>

              <div className="mt-5 max-w-4xl space-y-4 break-words leading-7 text-slate-600">
                {produto.descricao
                  .split(/\n\s*\n/)
                  .filter((paragrafo) =>
                    paragrafo.trim()
                  )
                  .map(
                    (
                      paragrafo,
                      index
                    ) => (
                      <p
                        key={index}
                        className="whitespace-pre-line"
                      >
                        {paragrafo}
                      </p>
                    )
                  )}
              </div>
            </section>
          )}

          {possuiConteudoExtra && (
            <section className="mt-8 space-y-6">
              {destaques.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                      Visão rápida
                    </p>

                    <h2
                      id="destaques"
                      className="mt-2 scroll-mt-6 text-2xl font-bold text-slate-950"
                    >
                      Destaques
                    </h2>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {destaques.map(
                      (
                        destaque,
                        index
                      ) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                        >
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="m5 12 4 4L19 6" />
                            </svg>
                          </div>

                          <p className="text-sm font-semibold leading-6 text-slate-700">
                            {destaque}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {fichaTecnica.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                      Especificações
                    </p>

                    <h2
                      id="ficha-tecnica"
                      className="mt-2 scroll-mt-6 text-2xl font-bold text-slate-950"
                    >
                      Ficha técnica
                    </h2>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    {fichaTecnica.map(
                      (item, index) => {
                        const partes =
                          item.split(":");

                        const titulo =
                          partes.length > 1
                            ? partes[0].trim()
                            : "";

                        const valor =
                          partes.length > 1
                            ? partes
                                .slice(1)
                                .join(":")
                                .trim()
                            : item;

                        return (
                          <div
                            key={index}
                            className="grid gap-1 break-words border-b border-slate-100 px-4 py-4 last:border-b-0 sm:grid-cols-[220px_1fr] sm:gap-6 sm:px-6"
                          >
                            {titulo && (
                              <span className="text-sm font-semibold text-slate-900">
                                {titulo}
                              </span>
                            )}

                            <span className="text-sm leading-6 text-slate-600">
                              {valor}
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

              {(pontosPositivos.length > 0 ||
                pontosAtencao.length > 0) && (
                <div className="grid gap-6 lg:grid-cols-2">
                  {pontosPositivos.length > 0 && (
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-600">
                        O que se destaca
                      </p>

                      <h2
                        id="pontos-positivos"
                        className="mt-2 scroll-mt-6 text-2xl font-bold text-slate-950"
                      >
                        Pontos positivos
                      </h2>

                      <div className="mt-6 space-y-4">
                        {pontosPositivos.map(
                          (
                            ponto,
                            index
                          ) => (
                            <div
                              key={index}
                              className="flex items-start gap-3"
                            >
                              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                                <svg
                                  width="15"
                                  height="15"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                >
                                  <path d="m5 12 4 4L19 6" />
                                </svg>
                              </div>

                              <p className="text-sm leading-6 text-slate-600">
                                {ponto}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {pontosAtencao.length > 0 && (
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
                        Antes de comprar
                      </p>

                      <h2
                        id="pontos-atencao"
                        className="mt-2 scroll-mt-6 text-2xl font-bold text-slate-950"
                      >
                        Pontos de atenção
                      </h2>

                      <div className="mt-6 space-y-4">
                        {pontosAtencao.map(
                          (
                            ponto,
                            index
                          ) => (
                            <div
                              key={index}
                              className="flex items-start gap-3"
                            >
                              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                                <svg
                                  width="15"
                                  height="15"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                >
                                  <path d="M12 9v4" />
                                  <path d="M12 17h.01" />
                                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                                </svg>
                              </div>

                              <p className="text-sm leading-6 text-slate-600">
                                {ponto}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {produtosRelacionados.length > 0 && (
            <section
              aria-labelledby="produtos-relacionados"
              className="mt-12 border-t border-slate-200 pt-8"
            >
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                    Continue explorando
                  </p>

                  <h2
                    id="produtos-relacionados"
                    className="mt-2 text-2xl font-bold text-slate-950"
                  >
                    Mais produtos desta categoria
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Conheça outras opções em{" "}
                    {produto.categoria}.
                  </p>
                </div>

                <Link
                  href={`/categoria/${encodeURIComponent(
                    produto.categoria
                  )}`}
                  className="rounded-lg px-3 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Ver toda a categoria{" "}
                  <span aria-hidden="true">
                    →
                  </span>
                </Link>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {produtosRelacionados.map(
                  (relacionado) => (
                    <Link
                      key={relacionado.id}
                      href={`/produtos/${relacionado.id}`}
                      className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      <div className="flex h-52 items-center justify-center bg-slate-100 p-5">
                        {relacionado.imagem ? (
                          <Image
                            src={relacionado.imagem}
                            alt={relacionado.nome}
                            unoptimized
                            width={320}
                            height={220}
                            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-sm text-slate-500">
                            Sem imagem disponível
                          </span>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <p className="text-xs font-semibold text-slate-500">
                          {relacionado.marca}
                        </p>

                        <h3 className="mt-2 break-words text-lg font-bold leading-6 text-slate-900 group-hover:text-blue-700">
                          {relacionado.nome}
                        </h3>

                        <div className="mt-auto pt-5">
                          <p className="text-xs text-slate-500">
                            {relacionado.preco !== null
                              ? "Preço encontrado"
                              : "Preço"}
                          </p>

                          <p className="mt-1 text-xl font-bold text-slate-900">
                            {relacionado.preco !== null
                              ? relacionado.preco.toLocaleString(
                                  "pt-BR",
                                  {
                                    style: "currency",
                                    currency: "BRL",
                                  }
                                )
                              : "Consulte na loja"}
                          </p>

                          <span className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition group-hover:bg-blue-100">
                            Conhecer produto{" "}
                            <span aria-hidden="true">
                              →
                            </span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />

      {produto.linkAfiliado && (
        <aside
          aria-label="Acesso rápido à oferta"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-blue-100 bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(15,23,42,0.08)] lg:hidden"
        >
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-slate-500">
                Preço encontrado
              </p>

              <p className="text-base font-bold text-slate-900 sm:text-xl">
                {produto.preco !== null
                  ? produto.preco.toLocaleString(
                      "pt-BR",
                      {
                        style: "currency",
                        currency: "BRL",
                      }
                    )
                  : "Consulte na loja"}
              </p>
            </div>

            <a
              href={produto.linkAfiliado}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="shrink-0 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Ver oferta{" "}
              <span aria-hidden="true">
                →
              </span>

              <span className="sr-only">
                {" "}
                na Amazon (abre em nova aba)
              </span>
            </a>
          </div>

          <p className="mx-auto mt-2 max-w-3xl text-xs text-slate-500">
            Preço sujeito a alteração. Link de afiliado.
            Cores e variações podem mudar conforme a oferta da
            loja.
          </p>
        </aside>
      )}
    </div>
  );
}