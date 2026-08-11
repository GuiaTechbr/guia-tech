import prisma from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

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

export default async function OfertasPage() {
  const produtos: Produto[] = await prisma.produto.findMany({
    take: 6,
  });

  return (
    <main className="min-h-screen bg-zinc-100 p-8">
      <h1 className="mb-8 text-4xl font-bold text-zinc-900">
        🔥 Ofertas em destaque
      </h1>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {produtos.map((produto: Produto) => (
          <ProductCard
            key={produto.id}
            produto={produto}
          />
        ))}
      </div>
    </main>
  );
}