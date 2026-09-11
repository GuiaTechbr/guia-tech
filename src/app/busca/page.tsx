import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import prisma from "@/lib/prisma";

type Props = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function BuscaPage({ searchParams }: Props) {
  const { q } = await searchParams;

  const termo = q?.trim() || "";

  const produtos = termo
    ? await prisma.produto.findMany({
        where: {
          OR: [
            {
              nome: {
                contains: termo,
              },
            },
            {
              marca: {
                contains: termo,
              },
            },
            {
              categoria: {
                contains: termo,
              },
            },
            {
              descricao: {
                contains: termo,
              },
            },
          ],
        },
        orderBy: {
          criadoEm: "desc",
        },
      })
    : [];

  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
            >
              <span aria-hidden="true">←</span>
              Voltar para o Guia Tech
            </Link>

            <div className="mt-7 max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                Busca
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {termo
                  ? `Resultados para "${termo}"`
                  : "Encontre produtos no Guia Tech"}
              </h1>

              <p className="mt-3 text-sm text-slate-500 sm:text-base">
                {termo
                  ? `${produtos.length} ${
                      produtos.length === 1
                        ? "produto encontrado"
                        : "produtos encontrados"
                    }`
                  : "Digite um termo na busca para encontrar produtos por nome, marca ou categoria."}
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          {produtos.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {produtos.map((produto) => (
                <ProductCard
                  key={produto.id}
                  produto={produto}
                />
              ))}
            </div>
          ) : (
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

              <h2 className="mt-5 text-2xl font-bold text-slate-900">
                {termo
                  ? "Nenhum produto encontrado"
                  : "Faça uma busca"}
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600 sm:text-base">
                {termo
                  ? "Não encontramos produtos para essa pesquisa. Tente buscar pelo nome, marca ou categoria."
                  : "Use a barra de busca no topo da página para encontrar o produto que procura."}
              </p>

              <Link
                href="/"
                className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
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