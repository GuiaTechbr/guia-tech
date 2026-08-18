import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import Categories from "@/components/Categories";
import FeaturedProducts from "@/components/FeaturedProducts";
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

      <main className="min-h-screen bg-slate-50">

        {/* HERO */}
        <section className="border-b border-blue-100 bg-gradient-to-br from-blue-50 via-white to-slate-50 px-6 py-16 sm:px-8 sm:py-20">

          <div className="mx-auto max-w-5xl text-center">

            <span className="inline-flex rounded-full border border-blue-200 bg-blue-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700">
              Tecnologia inteligente
            </span>

            <h1 className="mt-5 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
              🚀 Guia Tech
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
              Tecnologia inteligente para suas melhores escolhas.
              Encontre smartphones, notebooks e produtos de tecnologia
              com análises e ofertas selecionadas.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">

              <a
                href="#ofertas"
                className="w-full rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md sm:w-auto"
              >
                Ver ofertas
              </a>

              <a
                href="#categorias"
                className="w-full rounded-xl border border-zinc-300 bg-white px-7 py-3 font-semibold text-zinc-700 transition hover:border-blue-300 hover:text-blue-700 sm:w-auto"
              >
                Explorar categorias
              </a>

            </div>

          </div>

        </section>

        {/* CATEGORIAS */}
        <div id="categorias">
          <Categories />
        </div>

        {/* OFERTAS SELECIONADAS */}
        <FeaturedProducts />

        {/* SMARTPHONES */}
        <section className="border-t border-slate-200 bg-slate-50 px-4 py-10 sm:px-6 sm:py-12 lg:px-8">

          <div className="mx-auto max-w-7xl">

            <div className="mb-6 flex items-end justify-between gap-4">

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Smartphones
                </span>

                <h2 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900">
                  📱 Smartphones
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Encontre modelos para diferentes necessidades e orçamentos.
                </p>
              </div>

            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:gap-8 sm:overflow-visible lg:grid-cols-3">

              {smartphones.map((produto) => (
                <ProductCard
                  key={produto.id}
                  produto={produto}
                />
              ))}

            </div>

          </div>

        </section>

        {/* NOTEBOOKS */}
        <section className="border-t border-slate-200 bg-white px-4 py-10 sm:px-6 sm:py-12 lg:px-8">

          <div className="mx-auto max-w-7xl">

            <div className="mb-6 flex items-end justify-between gap-4">

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Notebooks
                </span>

                <h2 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900">
                  💻 Notebooks
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Opções para trabalho, estudos, produtividade e entretenimento.
                </p>
              </div>

            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:gap-8 sm:overflow-visible lg:grid-cols-3">

              {notebooks.map((produto) => (
                <ProductCard
                  key={produto.id}
                  produto={produto}
                />
              ))}

            </div>

          </div>

        </section>

        {/* OFERTAS EM DESTAQUE */}
        <section
          id="ofertas"
          className="border-t border-red-100 bg-gradient-to-b from-red-50/70 to-white px-4 py-12 sm:px-6 sm:py-14 lg:px-8"
        >

          <div className="mx-auto max-w-7xl">

            <div className="mb-8 text-center">

              <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-700">
                Oportunidades
              </span>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                🔥 Ofertas em destaque
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-600 sm:text-base">
                Produtos selecionados com grandes oportunidades de compra.
              </p>

            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:gap-8 sm:overflow-visible lg:grid-cols-3">

              {ofertas.map((produto) => (
                <ProductCard
                  key={produto.id}
                  produto={produto}
                />
              ))}

            </div>

          </div>

        </section>

      </main>
    </>
  );
}