import Link from "next/link";
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
    <section id="destaques" className="scroll-mt-6 border-t border-slate-200 bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              Explore o catálogo
            </span>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Novidades no Guia Tech
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Os produtos mais recentes do catálogo, com detalhes para ajudar na sua escolha.
            </p>
          </div>

          <Link
            href="/ofertas"
            className="w-fit text-sm font-semibold text-slate-600 transition-colors duration-300 hover:text-blue-600"
          >
            Ver todas as ofertas →
          </Link>

        </div>

        {produtos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="font-medium text-slate-700">
              Nenhuma oferta disponível no momento.
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Em breve teremos novos produtos em destaque.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
            {produtos.map((produto) => (
              <ProductCard
                key={produto.id}
                produto={produto}
                layout="grid"
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}