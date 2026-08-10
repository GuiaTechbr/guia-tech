import prisma from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

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
  });


  return (
    <main className="min-h-screen bg-zinc-100 p-8">

      <h1 className="mb-8 text-4xl font-bold text-zinc-900">
        {categoria}
      </h1>


      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

        {produtos.map((produto) => (
          <ProductCard
            key={produto.id}
            produto={produto}
          />
        ))}

      </div>


    </main>
  );
}