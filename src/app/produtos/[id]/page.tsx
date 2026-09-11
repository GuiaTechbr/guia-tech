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

function transformarEmLista(texto: string | null) {
  if (!texto) {
    return [];
  }

  return texto
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean);
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { id } = await params;

  const produto = await prisma.produto.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!produto) {
    return {
      title: "Produto não encontrado",
      description:
        "O produto solicitado não foi encontrado no Guia Tech.",
    };
  }

  const descricao =
    produto.descricao?.slice(0, 155) ||
    `Confira ${produto.nome} no Guia Tech, com informações, preço e oferta disponível.`;

  return {
    title: produto.nome,
    description: descricao,
    openGraph: {
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

  const produto = await prisma.produto.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!produto) {
    return (
      <>
        <Header />

        <main className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6">
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
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>

            <h1 className="mt-5 text-2xl font-bold text-slate-900 sm:text-3xl">
              Produto não encontrado
            </h1>

            <p className="mt-3 text-slate-600">
              Este produto pode ter sido removido ou não estar mais disponível.
            </p>

            <Link
              href="/"
              className="mt-7 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Voltar para o Guia Tech
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  const destaques = transformarEmLista(produto.destaques);
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
    <>
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
              <div className="flex min-h-[340px] items-center justify-center border-b border-slate-200 bg-slate-50 p-6 sm:min-h-[500px] sm:p-10 lg:border-b-0 lg:border-r">
                {produto.imagem ? (
                  <Image
                    src={produto.imagem}
                    alt={produto.nome}
                    width={650}
                    height={650}
                    className="max-h-[440px] w-full object-contain transition-transform duration-300 hover:scale-[1.02]"
                    priority
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

                <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl">
                  {produto.nome}
                </h1>

                <div className="mt-7 border-y border-slate-100 py-6">
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

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    O preço pode sofrer alterações na loja sem aviso prévio.
                  </p>
                </div>

                {produto.descricao && (
                  <div className="mt-7">
                    <h2 className="text-lg font-bold text-slate-900">
                      Sobre este produto
                    </h2>

                    <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">
                      {produto.descricao}
                    </p>
                  </div>
                )}

                <div className="mt-8">
                  {produto.linkAfiliado ? (
                    <a
                      href={produto.linkAfiliado}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-center text-base font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[0_10px_25px_rgba(37,99,235,0.18)] sm:text-lg"
                    >
                      Ver oferta na Amazon
                      <span aria-hidden="true">→</span>
                    </a>
                  ) : (
                    <div className="rounded-xl bg-slate-100 px-6 py-4 text-center text-sm font-semibold text-slate-500">
                      Oferta indisponível no momento
                    </div>
                  )}
                </div>

                <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                  Ao clicar, você será direcionado para a loja parceira.
                  O Guia Tech pode receber comissão pela compra, sem custo
                  adicional para você.
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
                      Produto selecionado pelo Guia Tech.
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
                      A compra é concluída diretamente na loja.
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
                      A comissão não aumenta o preço para você.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {possuiConteudoExtra && (
            <section className="mt-8 space-y-6">
              {destaques.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                      Visão rápida
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-slate-950">
                      Destaques
                    </h2>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {destaques.map(
                      (destaque, index) => (
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

                    <h2 className="mt-2 text-2xl font-bold text-slate-950">
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
                            className="grid gap-1 border-b border-slate-100 px-4 py-4 last:border-b-0 sm:grid-cols-[220px_1fr] sm:gap-6 sm:px-6"
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
                  {pontosPositivos.length >
                    0 && (
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-600">
                        O que se destaca
                      </p>

                      <h2 className="mt-2 text-2xl font-bold text-slate-950">
                        Pontos positivos
                      </h2>

                      <div className="mt-6 space-y-4">
                        {pontosPositivos.map(
                          (ponto, index) => (
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

                  {pontosAtencao.length >
                    0 && (
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">
                        Antes de comprar
                      </p>

                      <h2 className="mt-2 text-2xl font-bold text-slate-950">
                        Pontos de atenção
                      </h2>

                      <div className="mt-6 space-y-4">
                        {pontosAtencao.map(
                          (ponto, index) => (
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
        </div>
      </main>

      <Footer />
    </>
  );
}