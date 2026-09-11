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
      description: "O produto solicitado não foi encontrado no Guia Tech.",
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

export default async function ProdutoPage({ params }: Props) {
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
              Este produto pode ter sido removido ou não está mais disponível.
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

  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <Link
            href={`/categoria/${encodeURIComponent(produto.categoria)}`}
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
                      R$ {produto.preco.toLocaleString("pt-BR")}
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
                      ✓
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
                      ↗
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
        </div>
      </main>

      <Footer />
    </>
  );
}