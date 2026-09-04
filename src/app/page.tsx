import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import Categories from "@/components/Categories";
import FeaturedProducts from "@/components/FeaturedProducts";
import Footer from "@/components/Footer";
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
        <section className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-br from-blue-50 via-white to-slate-50 px-6 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-[-120px] top-[-120px] h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
            <div className="absolute bottom-[-140px] right-[-120px] h-80 w-80 rounded-full bg-sky-100/50 blur-3xl" />
          </div>

          <div className="mx-auto max-w-5xl text-center">
            <span className="inline-flex rounded-full border border-blue-200 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700 shadow-sm backdrop-blur">
              Tecnologia inteligente
            </span>

            <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Escolhas melhores em tecnologia começam aqui.
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Descubra smartphones, notebooks e produtos de tecnologia com
              análises, comparativos e ofertas selecionadas para ajudar você
              a comprar melhor.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#ofertas"
                className="w-full rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[0_10px_25px_rgba(37,99,235,0.20)] sm:w-auto"
              >
                Ver ofertas
              </a>

              <a
                href="#categorias"
                className="w-full rounded-xl border border-slate-300 bg-white px-7 py-3 font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700 sm:w-auto"
              >
                Explorar categorias
              </a>
            </div>

            <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-4 shadow-sm backdrop-blur">
                <p className="text-sm font-semibold text-slate-900">
                  Ofertas selecionadas
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Boas oportunidades em tecnologia
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-4 shadow-sm backdrop-blur">
                <p className="text-sm font-semibold text-slate-900">
                  Comparativos claros
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Ajuda para escolher o produto certo
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-4 shadow-sm backdrop-blur">
                <p className="text-sm font-semibold text-slate-900">
                  Conteúdo independente
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Informação direta para sua decisão
                </p>
              </div>
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
        <section className="border-t border-slate-200 bg-white px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                  Smartphones
                </span>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Smartphones em destaque
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                  Encontre modelos para diferentes necessidades e orçamentos.
                </p>
              </div>

              <a
                href="/categoria/Smartphone"
                className="hidden text-sm font-semibold text-slate-600 transition-colors duration-300 hover:text-blue-600 sm:block"
              >
                Ver todos →
              </a>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible lg:grid-cols-3">
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
        <section className="border-t border-slate-200 bg-slate-50 px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                  Notebooks
                </span>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Notebooks em destaque
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                  Opções para trabalho, estudos, produtividade e entretenimento.
                </p>
              </div>

              <a
                href="/categoria/Notebook"
                className="hidden text-sm font-semibold text-slate-600 transition-colors duration-300 hover:text-blue-600 sm:block"
              >
                Ver todos →
              </a>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible lg:grid-cols-3">
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
                Ofertas em destaque
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-600 sm:text-base">
                Produtos selecionados com grandes oportunidades de compra.
              </p>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible lg:grid-cols-3">
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

      <Footer />
    </>
  );
}