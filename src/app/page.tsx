import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import prisma from "@/lib/prisma";

export default async function Home() {

  const smartphones = await prisma.produto.findMany({
    where: {
      categoria: "Smartphone",
    },
  });


  const notebooks = await prisma.produto.findMany({
    where: {
      categoria: "Notebook",
    },
  });


  return (
    <>
      <Header />


      <main className="min-h-screen bg-zinc-100">


        <section className="bg-white px-8 py-16 text-center">

          <h1 className="text-5xl font-bold text-zinc-900">
            Guia Tech
          </h1>

          <p className="mt-4 text-lg text-zinc-600">
            Tecnologia, ofertas e análises dos melhores produtos.
          </p>

        </section>



        <section className="px-8 py-10">


          <h2 className="mb-6 text-3xl font-bold">
            🔥 Smartphones
          </h2>


          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

            {smartphones.map((produto)=>(
              <ProductCard
                key={produto.id}
                produto={produto}
              />
            ))}

          </div>


        </section>




        <section className="px-8 py-10">


          <h2 className="mb-6 text-3xl font-bold">
            💻 Notebooks
          </h2>


          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

            {notebooks.map((produto)=>(
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