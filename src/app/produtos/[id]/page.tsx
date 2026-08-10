import Image from "next/image";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProdutoPage({ params }: Props) {
  const { id } = await params;

  const produto = await prisma.produto.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!produto) {
    return (
      <main className="p-10">
        <h1 className="text-3xl font-bold">
          Produto não encontrado
        </h1>
      </main>
    );
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-zinc-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">

        <div className="grid md:grid-cols-2 gap-8">

          <div className="flex justify-center items-center bg-zinc-100 rounded-lg">
            {produto.imagem && (
              <Image
                src={produto.imagem}
                alt={produto.nome}
                width={500}
                height={500}
                className="object-contain"
              />
            )}
          </div>

          <div>

            <h1 className="text-3xl font-bold text-zinc-900">
              {produto.nome}
            </h1>

            <p className="mt-2 text-zinc-600">
              {produto.marca} • {produto.categoria}
            </p>

            <p className="mt-6 text-2xl font-bold text-green-600">
              R$ {produto.preco?.toLocaleString("pt-BR")}
            </p>

            <p className="mt-6 text-zinc-700">
              {produto.descricao}
            </p>

            <a
              href={produto.linkAfiliado || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 block text-center bg-black text-white rounded-lg py-3 font-semibold hover:bg-zinc-800"
            >
              Comprar na Amazon
            </a>

          </div>

        </div>

           </div>
    </main>
    </>
  );
}