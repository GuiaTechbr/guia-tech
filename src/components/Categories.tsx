import Link from "next/link";

const categorias = [
  {
    nome: "Smartphones",
    url: "Smartphone",
    emoji: "📱",
  },
  {
    nome: "Notebooks",
    url: "Notebook",
    emoji: "💻",
  },
  {
    nome: "Smart TVs",
    url: "Smart TV",
    emoji: "📺",
  },
  {
    nome: "Games",
    url: "Games",
    emoji: "🎮",
  },
  {
    nome: "Casa Inteligente",
    url: "Casa Inteligente",
    emoji: "🏠",
  },
];

export default function Categories() {
  return (
    <section className="px-8 py-10">

      <h2 className="mb-6 text-3xl font-bold text-zinc-900">
        Categorias
      </h2>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">

        {categorias.map((categoria) => (
          <Link
            key={categoria.nome}
            href={`/categoria/${encodeURIComponent(categoria.url)}`}
            className="cursor-pointer rounded-2xl bg-white p-6 text-center shadow-md transition hover:-translate-y-1 hover:shadow-xl"
          >

            <div className="text-4xl">
              {categoria.emoji}
            </div>

            <h3 className="mt-3 font-semibold">
              {categoria.nome}
            </h3>

          </Link>
        ))}

      </div>

    </section>
  );
}