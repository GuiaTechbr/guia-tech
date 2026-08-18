import Image from "next/image";
import Link from "next/link";
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
      <>
        <Header />

        <main className="min-h-screen bg-zinc-100 px-6 py-16">
          <div className="mx-auto max-w-4xl rounded-2xl bg-white p-10 text-center shadow-sm">
            <h1 className="text-3xl font-bold text-zinc-900">
              Produto não encontrado
            </h1>

            <Link
              href="/"
              className="mt-6 inline-block rounded-lg bg-black px-6 py-3 font-semibold text-white transition hover:bg-zinc-800"
            >
              Voltar para o Guia Tech
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-6xl">

          <Link
            href={`/categoria/${encodeURIComponent(produto.categoria)}`}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 transition hover:text-black"
          >
            ← Voltar para {produto.categoria}
          </Link>

          <section className="overflow-hidden rounded-2xl bg-white shadow-sm">

            <div className="grid md:grid-cols-2">

              {/* IMAGEM */}
              <div className="flex min-h-[320px] items-center justify-center bg-zinc-50 p-6 sm:min-h-[500px] sm:p-10">
                {produto.imagem ? (
                  <Image
                    src={produto.imagem}
                    alt={produto.nome}
                    width={600}
                    height={600}
                    className="max-h-[420px] w-full object-contain"
                    priority
                  />
                ) : (
                  <span className="text-zinc-400">
                    Sem imagem disponível
                  </span>
                )}
              </div>

              {/* INFORMAÇÕES */}
              <div className="flex flex-col p-6 sm:p-10">

                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                    {produto.categoria}
                  </span>

                  <span className="text-sm text-zinc-500">
                    {produto.marca}
                  </span>
                </div>

                <h1 className="text-3xl font-bold leading-tight text-zinc-900 sm:text-4xl">
                  {produto.nome}
                </h1>

                <div className="mt-6">
                  <p className="text-sm font-medium text-zinc-500">
                    Preço encontrado
                  </p>

                  <p className="mt-1 text-3xl font-bold text-green-600 sm:text-4xl">
                    R$ {produto.preco?.toLocaleString("pt-BR")}
                  </p>
                </div>

                {produto.descricao && (
                  <div className="mt-7">
                    <h2 className="text-lg font-bold text-zinc-900">
                      Sobre este produto
                    </h2>

                    <p className="mt-3 leading-7 text-zinc-600">
                      {produto.descricao}
                    </p>
                  </div>
                )}

                <div className="mt-8">
                  {produto.linkAfiliado ? (
                    <a
                      href={produto.linkAfiliado}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full rounded-xl bg-black px-6 py-4 text-center text-base font-bold text-white transition hover:bg-zinc-800 sm:text-lg"
                    >
                      🔥 Ver oferta na Amazon
                    </a>
                  ) : (
                    <div className="rounded-xl bg-zinc-100 px-6 py-4 text-center text-sm font-semibold text-zinc-500">
                      Oferta indisponível no momento
                    </div>
                  )}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">

  <div className="rounded-xl bg-zinc-50 p-4 text-center">
    <div className="text-xl">🛒</div>
    <p className="mt-2 text-xs font-bold text-zinc-800">
      Oferta na Amazon
    </p>
    <p className="mt-1 text-[11px] text-zinc-500">
      Consulte a oferta disponível
    </p>
  </div>

  <div className="rounded-xl bg-zinc-50 p-4 text-center">
    <div className="text-xl">🔗</div>
    <p className="mt-2 text-xs font-bold text-zinc-800">
      Link externo
    </p>
    <p className="mt-1 text-[11px] text-zinc-500">
      Você será direcionado à Amazon
    </p>
  </div>

  <div className="rounded-xl bg-zinc-50 p-4 text-center">
    <div className="text-xl">💻</div>
    <p className="mt-2 text-xs font-bold text-zinc-800">
      Compra na loja
    </p>
    <p className="mt-1 text-[11px] text-zinc-500">
      Finalize a compra diretamente na Amazon
    </p>
  </div>

</div>

              </div>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}