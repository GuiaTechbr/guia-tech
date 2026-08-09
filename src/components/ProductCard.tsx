import Image from "next/image";

interface Produto {
  id: number;
  nome: string;
  marca: string;
  categoria: string;
  descricao: string | null;
  preco: number | null;
  imagem: string | null;
  linkAfiliado: string | null;
  criadoEm: Date;
}

interface Props {
  produto: Produto;
}

export default function ProductCard({ produto }: Props) {
  return (
    <div className="group rounded-2xl bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl">

      <div className="relative mb-5 flex h-56 items-center justify-center rounded-xl bg-zinc-100 overflow-hidden">

        {produto.imagem ? (
          <Image
            src={produto.imagem}
            alt={produto.nome}
            width={350}
            height={350}
            className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-zinc-400">
            Sem imagem
          </span>
        )}

      </div>

      <span className="rounded-full bg-black px-3 py-1 text-xs text-white">
        {produto.categoria}
      </span>


      <h3 className="mt-4 text-xl font-bold text-zinc-900">
        {produto.nome}
      </h3>


      <p className="mt-2 text-sm text-zinc-500">
        {produto.marca}
      </p>


      {produto.descricao && (
        <p className="mt-3 text-sm text-zinc-600">
          {produto.descricao}
        </p>
      )}


      <div className="mt-5 flex items-center justify-between">

        <p className="text-2xl font-bold text-green-600">
          R$ {produto.preco?.toLocaleString("pt-BR")}
        </p>

      </div>


   <a
  href={`/produtos/${produto.id}`}
  className="mt-5 block w-full rounded-xl bg-black px-4 py-3 text-center font-semibold text-white transition hover:bg-zinc-800"
>
  Ver oferta
</a>

    </div>
  );
}