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

export default function Categories() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-7">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            Categorias
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Encontre tecnologia para todos os momentos.
          </p>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory touch-pan-x sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:pb-0 sm:snap-none lg:grid-cols-5">

          {categorias.map((categoria) => (
            <Link
              key={categoria.nome}
              href={`/categoria/${encodeURIComponent(categoria.url)}`}
              className="group flex min-h-[190px] w-[78vw] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-xl sm:w-auto"
            >

              <div className="flex flex-1 items-center justify-center rounded-xl bg-zinc-50 p-3 transition-colors duration-300 group-hover:bg-zinc-100">

                <Image
                  src={categoria.imagem}
                  alt={categoria.nome}
                  width={160}
                  height={120}
                  className="h-28 w-36 object-contain transition-transform duration-300 group-hover:scale-105"
                />

              </div>

              <div className="pt-4 text-center">

                <h3 className="font-semibold text-zinc-900 transition-colors duration-300 group-hover:text-black">
                  {categoria.nome}
                </h3>

                <p className="mt-1 text-xs text-zinc-400">
                  Ver produtos →
                </p>

              </div>

            </Link>
          ))}

        </div>

      </div>
    </section>
  );
}