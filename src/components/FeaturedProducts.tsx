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
    <section className="px-8 py-10">

      <h2 className="mb-6 text-3xl font-bold text-zinc-900">
        🔥 Ofertas em destaque
      </h2>


      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

        {produtos.map((produto) => (
          <ProductCard
            key={produto.id}
            produto={produto}
          />
        ))}

      </div>


    </section>
  );
}