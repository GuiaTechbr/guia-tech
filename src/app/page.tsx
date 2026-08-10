import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import Categories from "@/components/Categories";
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


  const ofertas = await prisma.produto.findMany({
    take: 3,
  });



  return (
    <>
      <Header />

      <main className="min-h-screen bg-zinc-100">


        <section className="bg-white px-8 py-20 text-center">

  <h1 className="text-5xl font-bold text-zinc-900">
    🚀 Guia Tech
  </h1>

  <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-600">
    Tecnologia inteligente para suas melhores escolhas.
    Encontre smartphones, notebooks e produtos de tecnologia
    com análises e ofertas selecionadas.
  </p>

  <a
    href="#ofertas"
    className="mt-8 inline-block rounded-lg bg-black px-8 py-3 font-semibold text-white hover:bg-zinc-800"
  >
    Ver ofertas
  </a>

</section>


        <Categories />


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

        <section
  id="ofertas"
  className="bg-white px-8 py-14"
>
          <h2 className="text-center text-3xl font-bold text-zinc-900">
  ⭐ Ofertas em destaque
</h2>

<p className="mb-8 mt-3 text-center text-zinc-600">
  Produtos selecionados com grandes oportunidades de compra.
</p>


          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

            {ofertas.map((produto) => (
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