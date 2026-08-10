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
  });


  return (
    <>
      <Header />

      <main className="min-h-screen bg-zinc-100 p-8">


        <div className="mb-8">

          <Link
            href="/"
            className="text-sm text-zinc-600 hover:text-black"
          >
            ← Voltar para início
          </Link>


          <h1 className="mt-4 text-4xl font-bold text-zinc-900">
            {categoria}s em destaque
          </h1>


          <p className="mt-2 text-zinc-600">
            Encontramos {produtos.length} produto(s) nesta categoria.
          </p>

        </div>



        {produtos.length === 0 ? (

          <div className="rounded-xl bg-white p-10 text-center shadow">
            <h2 className="text-xl font-semibold">
              Nenhum produto encontrado.
            </h2>

            <p className="mt-2 text-zinc-600">
              Estamos preparando novos produtos para esta categoria.
            </p>
          </div>


        ) : (


          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

            {produtos.map((produto: (typeof produtos)[number]) => (

              <ProductCard
                key={produto.id}
                produto={produto}
              />

            ))}

          </div>


        )}


      </main>
    </>
  );
}