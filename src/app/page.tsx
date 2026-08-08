
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import prisma from "@/lib/prisma";

export default async function Home() {
  const produtos = await prisma.produto.findMany({
    orderBy: {
      criadoEm: "desc",
    },
  });

  return (
    <>
      <Header />

      <main className="min-h-screen bg-zinc-100 p-8">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-zinc-900">
          Guia Tech
        </h1>

        <p className="mt-2 text-zinc-600">
          Tecnologia, ofertas e os melhores produtos em um só lugar.
        </p>
      </header>

      <section>
        <h2 className="mb-6 text-2xl font-semibold text-zinc-800">
          Produtos em destaque
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {produtos.map((produto) => (
  <ProductCard
    key={produto.id}
    produto={produto}
  />
))}
</div>
</section>
</main>
    </>
  );
}