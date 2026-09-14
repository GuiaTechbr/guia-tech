import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import CatalogProducts from "@/components/CatalogProducts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Props = {
  params: Promise<{
    nome: string;
  }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { nome } = await params;

  const categoria = nome;

  const quantidade = await prisma.produto.count({
    where: {
      categoria,
    },
  });

  const description =
    quantidade > 0
      ? `Confira ${quantidade} ${
          quantidade === 1 ? "produto selecionado" : "produtos selecionados"
        } na categoria ${categoria} do Guia Tech.`
      : `Explore a categoria ${categoria} no Guia Tech e acompanhe novas recomendações, ofertas e produtos.`;

  return {
    alternates: { canonical: `/categoria/${encodeURIComponent(categoria)}` },
    robots: quantidade > 0 ? { index: true, follow: true } : { index: false, follow: true },
    title: categoria,
    description,
    openGraph: {
      url: `/categoria/${encodeURIComponent(categoria)}`,
      siteName: "Guia Tech",
      locale: "pt_BR",
      title: categoria,
      description,
      type: "website",
    },
  };
}

export default async function CategoriaPage({ params }: Props) {
  const { nome } = await params;

  const categoria = nome;

  const produtos = await prisma.produto.findMany({
    where: {
      categoria,
    },
    orderBy: {
      criadoEm: "desc",
    },
  });

  const quantidade = produtos.length;

  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
            >
              <span aria-hidden="true">←</span>
              Voltar para o início
            </Link>

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
                  : quantidade === 1
                    ? "Encontramos 1 produto selecionado nesta categoria."
                    : `Encontramos ${quantidade} produtos selecionados nesta categoria.`}
              </p>
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
                  <line x1="12" y1="22" x2="12" y2="12" />
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
            <CatalogProducts key={categoria} produtos={produtos.map(({ id, nome, marca, categoria, preco, imagem }) => ({ id, nome, marca, categoria, preco, imagem }))} />
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}