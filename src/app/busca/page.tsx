import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import prisma from "@/lib/prisma";
import Link from "next/link";

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

      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="mb-8">
            <Link
              href="/"
              className="text-sm font-semibold text-zinc-600 transition hover:text-black"
            >
              ← Voltar para o Guia Tech
            </Link>

            <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-blue-600">
              Busca
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Resultados para "{termo}"
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              {produtos.length}{" "}
              {produtos.length === 1
                ? "produto encontrado"
                : "produtos encontrados"}
            </p>
          </div>

          {produtos.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {produtos.map((produto) => (
                <ProductCard
                  key={produto.id}
                  produto={produto}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <div className="text-4xl">🔎</div>

              <h2 className="mt-4 text-xl font-bold text-zinc-900">
                Nenhum produto encontrado
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                Não encontramos produtos para essa busca. Tente pesquisar
                pelo nome, marca ou categoria.
              </p>

              <Link
                href="/"
                className="mt-6 inline-block rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                Voltar para o início
              </Link>
            </div>
          )}

        </div>
      </main>
    </>
  );
}