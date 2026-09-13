"use client";

import Link from "next/link";
import CatalogProducts from "@/components/CatalogProducts";
import { useFavorites } from "@/lib/favorites";

type Produto = { id: number; nome: string; marca: string; categoria: string; preco: number | null; imagem: string | null };
export default function FavoriteProducts({ produtos }: { produtos: Produto[] }) {
  const { ids, ready } = useFavorites();
  const salvos = produtos.filter((produto) => ids.includes(produto.id));
  if (!ready) return <p role="status" className="text-slate-600">Carregando seus favoritos…</p>;
  return (
    <>
      {ids.some((id) => !produtos.some((produto) => produto.id === id)) && <p className="mb-5 text-sm text-slate-600">Alguns produtos salvos não estão mais disponíveis no catálogo.</p>}
      {salvos.length > 0 ? <CatalogProducts produtos={salvos} filtrarCategoria /> : (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Sua lista está vazia</h2>
          <p className="mx-auto mt-3 max-w-md leading-7 text-slate-600">Toque em Favoritar nos cartões dos produtos para guardar suas opções aqui.</p>
          <Link href="/ofertas" className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Explorar produtos</Link>
        </div>
      )}
    </>
  );
}
