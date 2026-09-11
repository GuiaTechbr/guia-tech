import Link from "next/link";
import prisma from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ordemCategorias = [
  "Smartphone",
  "Notebook",
  "Smart TV",
  "Games",
  "Casa Inteligente",
];

export default async function OfertasPage() {
  const produtos = await prisma.produto.findMany({
    take: 12,
    orderBy: {
      criadoEm: "desc",
    },
  });

  const produtosPorCategoria = ordemCategorias
    .map((categoria) => ({
      categoria,
      produtos: produtos.filter(
        (produto) => produto.categoria === categoria
      ),
    }))
    .filter((grupo) => grupo.produtos.length > 0);

  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              Guia Tech
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Ofertas selecionadas
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Encontre produtos de tecnologia selecionados pelo Guia Tech,
              organizados por categoria para facilitar sua escolha.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Voltar para o início
              </Link>

              <a
                href="#produtos"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-600"
              >
                Ver produtos
              </a>
            </div>
          </div>
        </section>

        <section
          id="produtos"
          className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
        >
          {produtosPorCategoria.length === 0 ? (
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
                  <path d="M21 8a2 2 0 0 0-2-2h-1.586a2 2 0 0 1-1.414-.586l-1.414-1.414A2 2 0 0 0 13.172 3H10.83a2 2 0 0 0-1.414.586L8 5a2 2 0 0 1-1.414.586H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2Z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </div>

              <h2 className="mt-5 text-2xl font-bold text-slate-900">
                Nenhuma oferta encontrada
              </h2>

              <p className="mt-3 text-slate-600">
                Novos produtos serão adicionados em breve.
              </p>

              <Link
                href="/"
                className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Voltar para a página inicial
              </Link>
            </div>
          ) : (
            <div className="space-y-14">
              {produtosPorCategoria.map(
                ({ categoria, produtos: produtosCategoria }) => (
                  <section key={categoria}>
                    <div className="mb-6 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
                          Categoria
                        </p>

                        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                          {categoria}
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                          {produtosCategoria.length}{" "}
                          {produtosCategoria.length === 1
                            ? "produto selecionado"
                            : "produtos selecionados"}
                        </p>
                      </div>

                      <Link
                        href={`/categoria/${encodeURIComponent(categoria)}`}
                        className="hidden text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 sm:inline-flex"
                      >
                        Ver categoria →
                      </Link>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory touch-pan-x sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pb-0 sm:snap-none lg:grid-cols-3">
                      {produtosCategoria.map((produto) => (
                        <ProductCard
                          key={produto.id}
                          produto={produto}
                        />
                      ))}
                    </div>

                    <div className="mt-4 sm:hidden">
                      <Link
                        href={`/categoria/${encodeURIComponent(categoria)}`}
                        className="text-sm font-semibold text-blue-600"
                      >
                        Ver categoria →
                      </Link>
                    </div>
                  </section>
                )
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}