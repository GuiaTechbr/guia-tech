import prisma from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";

const ordemCategorias = [
  "Smartphone",
  "Notebook",
  "Smart TV",
  "Games",
  "Casa Inteligente",
];

const nomesCategorias: Record<string, string> = {
  Smartphone: "📱 Smartphones",
  Notebook: "💻 Notebooks",
  "Smart TV": "📺 Smart TVs",
  Games: "🎮 Games",
  "Casa Inteligente": "🏠 Casa Inteligente",
};

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

      <main className="min-h-screen bg-zinc-100">
        {/* Cabeçalho da página */}
        <section className="border-b border-zinc-200 bg-white px-6 py-14 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Guia Tech
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
              🔥 Ofertas
            </h1>

            <p className="mt-4 max-w-2xl text-lg text-zinc-600">
              Produtos selecionados com grandes oportunidades de compra
              para você encontrar tecnologia de qualidade por bons preços.
            </p>
          </div>
        </section>

        {/* Produtos */}
        <section className="px-6 py-12 sm:px-8">
          <div className="mx-auto max-w-7xl">
            {produtosPorCategoria.length === 0 ? (
              <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                <div className="mb-4 text-5xl">📦</div>

                <h2 className="text-2xl font-bold text-zinc-900">
                  Nenhuma oferta encontrada
                </h2>

                <p className="mt-3 text-zinc-600">
                  Estamos preparando novas ofertas para você.
                </p>
              </div>
            ) : (
              <div className="space-y-16">
                {produtosPorCategoria.map(
                  ({ categoria, produtos: produtosCategoria }) => (
                    <section key={categoria}>
                      <div className="mb-7 flex items-end justify-between gap-4">
                        <div>
                          <h2 className="text-3xl font-bold text-zinc-900">
                            {nomesCategorias[categoria] ?? categoria}
                          </h2>

                          <p className="mt-2 text-zinc-600">
                            {produtosCategoria.length}{" "}
                            {produtosCategoria.length === 1
                              ? "produto selecionado"
                              : "produtos selecionados"}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {produtosCategoria.map((produto) => (
                          <ProductCard
                            key={produto.id}
                            produto={produto}
                          />
                        ))}
                      </div>
                    </section>
                  )
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}