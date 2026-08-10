import Image from "next/image";
import Link from "next/link";

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
    <div className="group overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl">


      <div className="relative flex h-64 items-center justify-center bg-zinc-100">


        {produto.imagem ? (
          <Image
            src={produto.imagem}
            alt={produto.nome}
            width={400}
            height={400}
            className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-zinc-400">
            Sem imagem
          </span>
        )}


        <span className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
          🔥 Oferta
        </span>


      </div>



      <div className="p-5">


        <span className="rounded-full bg-black px-3 py-1 text-xs text-white">
          {produto.categoria}
        </span>



        <h3 className="mt-4 line-clamp-2 text-xl font-bold text-zinc-900">
          {produto.nome}
        </h3>



        <p className="mt-2 text-sm text-zinc-500">
          {produto.marca}
        </p>



        {produto.descricao && (
          <p className="mt-3 line-clamp-3 text-sm text-zinc-600">
            {produto.descricao}
          </p>
        )}



        <p className="mt-5 text-2xl font-bold text-green-600">
          R$ {produto.preco?.toLocaleString("pt-BR")}
        </p>



        <Link
          href={`/produtos/${produto.id}`}
          className="mt-5 block rounded-xl bg-black px-4 py-3 text-center font-semibold text-white transition hover:bg-zinc-800"
        >
          Ver oferta
        </Link>


      </div>

    </div>
  );
}