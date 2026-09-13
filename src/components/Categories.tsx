import Image from "next/image";
import Link from "next/link";

const categorias = [
  {
    nome: "Smartphones",
    url: "Smartphone",
    imagem: "/categorias/smartphone.jpg",
  },
  {
    nome: "Notebooks",
    url: "Notebook",
    imagem: "/categorias/notebook.jpg",
  },
  {
    nome: "Smart TVs",
    url: "Smart TV",
    imagem: "/categorias/smartv.jpg",
  },
  {
    nome: "Games",
    url: "Games",
    imagem: "/categorias/games.jpg",
  },
  {
    nome: "Casa Inteligente",
    url: "Casa Inteligente",
    imagem: "/categorias/casa-inteligente.jpg",
  },
];

export default function Categories({ quantidades = {} }: { quantidades?: Record<string, number> }) {
  return (
    <section id="categorias" className="scroll-mt-6 px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              Explore
            </span>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Categorias
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Escolha uma categoria para ver os produtos disponíveis.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
          {categorias.map((categoria) => (
            <Link
              key={categoria.nome}
              href={`/categoria/${encodeURIComponent(categoria.url)}`}
              className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_12px_30px_rgba(37,99,235,0.14)] sm:w-auto sm:p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-xl bg-slate-50 p-3">
                <Image
                  src={categoria.imagem}
                  alt={categoria.nome}
                  width={180}
                  height={140}
                  className="h-24 w-full object-contain transition-transform duration-300 group-hover:scale-110 sm:h-32 sm:w-40"
                />

                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-slate-200/70" />
              </div>

              <div className="px-1 pt-4">
                <h3 className="font-semibold text-slate-900 transition-colors duration-300 group-hover:text-blue-700">
                  {categoria.nome}
                </h3>

                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {quantidades[categoria.url] ? `${quantidades[categoria.url]} produto${quantidades[categoria.url] === 1 ? "" : "s"}` : "Em breve"}
                  </span>

                  <span className="text-sm font-semibold text-blue-600 transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}