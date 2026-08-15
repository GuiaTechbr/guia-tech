import Link from "next/link";
import prisma from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";

type Props = {
  params: Promise<{
    nome: string;
  }>;
};

export default async function CategoriaPage({ params }: Props) {
  const { nome } = await params;

  const categoria = decodeURIComponent(nome);

  const produtos = await prisma.produto.findMany({
    where: {
      categoria: categoria,
    },
    orderBy: {
      criadoEm: "desc",
    },
  });

  const quantidade = produtos.length;

  const gridClass =
    quantidade === 1
      ? "mx-auto max-w-md"
      : quantidade === 2
        ? "mx-auto max-w-4xl grid sm:grid-cols-2"
        : "grid sm:grid-cols-2 lg:grid-cols-3";

  return (
    <>
      <Header />

      <main className="min-h-screen bg-zinc-100 px-6 py-10 sm:px-8">
        <div className="mx-auto max-w-7xl">

          {/* Cabeçalho */}
          <div className="mb-10">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-zinc-500 transition hover:text-black"
            >
              ← Voltar para início
            </Link>

            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Guia Tech
              </p>

              <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
                {categoria}
              </h1>

              <p className="mt-3 text-zinc-600">
                {quantidade === 0
                  ? "Confira em breve novos produtos selecionados para esta categoria."
                  : `${quantidade} ${
                      quantidade === 1 ? "produto encontrado" : "produtos encontrados"
                    } nesta categoria.`}
              </p>
            </div>
          </div>

          {/* Produtos */}
          {quantidade === 0 ? (
            <div className="mx-auto max-w-2xl rounded-2xl bg-white p-12 text-center shadow-sm">
              <div className="mb-4 text-5xl">📦</div>

              <h2 className="text-2xl font-bold text-zinc-900">
                Nenhum produto encontrado
              </h2>

              <p className="mt-3 text-zinc-600">
                Estamos preparando novos produtos para esta categoria.
              </p>

              <Link
                href="/"
                className="mt-6 inline-flex rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                Voltar para a página inicial
              </Link>
            </div>
          ) : (
            <div className={`gap-8 ${gridClass}`}>
              {produtos.map((produto) => (
                <ProductCard
                  key={produto.id}
                  produto={produto}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}