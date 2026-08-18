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
    <Link
      href={`/produtos/${produto.id}`}
      className="group block w-[31vw] min-w-[120px] max-w-[180px] shrink-0 rounded-xl bg-white p-2 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:w-auto sm:max-w-none sm:p-4"
    >
      <div className="relative mb-2 flex h-28 items-center justify-center overflow-hidden rounded-lg bg-zinc-100 sm:mb-4 sm:h-48">
        {produto.imagem ? (
          <Image
            src={produto.imagem}
            alt={produto.nome}
            width={350}
            height={350}
            className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-xs text-zinc-400">
            Sem imagem
          </span>
        )}
      </div>

      <span className="inline-block rounded-full bg-black px-2 py-0.5 text-[9px] text-white sm:px-3 sm:py-1 sm:text-xs">
        {produto.categoria}
      </span>

      <h3 className="mt-2 line-clamp-2 text-xs font-bold leading-tight text-zinc-900 sm:mt-3 sm:text-lg">
        {produto.nome}
      </h3>

      <p className="mt-1 truncate text-[10px] text-zinc-500 sm:text-sm">
        {produto.marca}
      </p>

      <div className="mt-2 sm:mt-4">
        <p className="text-sm font-bold text-green-600 sm:text-xl">
          R$ {produto.preco?.toLocaleString("pt-BR")}
        </p>
      </div>

      <div className="mt-2 w-full rounded-lg bg-black px-2 py-2 text-center text-[10px] font-semibold text-white transition group-hover:bg-zinc-800 sm:mt-4 sm:px-4 sm:py-3 sm:text-sm">
        Ver oferta
      </div>
    </Link>
  );
}