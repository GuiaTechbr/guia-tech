import prisma from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export default async function FeaturedProducts() {
  const produtos = await prisma.produto.findMany({
    take: 3,
    orderBy: {
      criadoEm: "desc",
    },
  });

  return (
    <section className="bg-zinc-50 px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-red-600">
              Ofertas selecionadas
            </span>

            <h2 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900">
              🔥 Ofertas em destaque
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-zinc-500">
              Produtos selecionados para você encontrar boas oportunidades
              em tecnologia.
            </p>
          </div>

          <a
            href="/ofertas"
            className="w-fit text-sm font-semibold text-zinc-700 transition hover:text-black"
          >
            Ver todas as ofertas →
          </a>

        </div>

        {produtos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
            <p className="font-medium text-zinc-700">
              Nenhuma oferta disponível no momento.
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              Em breve teremos novos produtos em destaque.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {produtos.map((produto) => (
              <ProductCard
                key={produto.id}
                produto={produto}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}