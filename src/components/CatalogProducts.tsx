"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";

type ProdutoCatalogo = {
  id: number;
  nome: string;
  marca: string;
  categoria: string;
  preco: number | null;
  imagem: string | null;
};

export default function CatalogProducts({ produtos }: { produtos: ProdutoCatalogo[] }) {
  const [marca, setMarca] = useState("");
  const [ordem, setOrdem] = useState("recentes");
  const marcas = Array.from(new Set(produtos.map((produto) => produto.marca))).sort((a, b) => a.localeCompare(b, "pt-BR"));
  const visiveis = produtos.filter((produto) => !marca || produto.marca === marca);

  if (ordem === "nome") {
    visiveis.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR") || a.id - b.id);
  } else if (ordem === "menor-preco" || ordem === "maior-preco") {
    visiveis.sort((a, b) => {
      // Preços não informados ficam no fim em ambas as direções.
      if (a.preco === null && b.preco === null) return a.id - b.id;
      if (a.preco === null) return 1;
      if (b.preco === null) return -1;
      return (ordem === "menor-preco" ? a.preco - b.preco : b.preco - a.preco) || a.id - b.id;
    });
  }

  function limparFiltros() {
    setMarca("");
    setOrdem("recentes");
  }

  return (
    <div>
      <div className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <div>
          <label htmlFor="catalogo-marca" className="mb-2 block text-sm font-semibold text-slate-700">Marca</label>
          <select id="catalogo-marca" value={marca} onChange={(event) => setMarca(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
            <option value="">Todas as marcas</option>
            {marcas.filter(Boolean).map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="catalogo-ordem" className="mb-2 block text-sm font-semibold text-slate-700">Ordenar por</label>
          <select id="catalogo-ordem" value={ordem} onChange={(event) => setOrdem(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
            <option value="recentes">Mais recentes</option>
            <option value="menor-preco">Menor preço</option>
            <option value="maior-preco">Maior preço</option>
            <option value="nome">Nome (A–Z)</option>
          </select>
        </div>
        <button type="button" onClick={limparFiltros} disabled={!marca && ordem === "recentes"} className="rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50">Limpar filtros</button>
      </div>

      <p role="status" aria-live="polite" className="mb-5 text-sm text-slate-500">Exibindo {visiveis.length} de {produtos.length} produto(s).</p>
      {visiveis.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
          {visiveis.map((produto) => <ProductCard key={produto.id} produto={produto} layout="grid" />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="font-semibold text-slate-900">Nenhum produto encontrado para esta marca.</p>
          <button type="button" onClick={limparFiltros} className="mt-4 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700">Mostrar todos os produtos</button>
        </div>
      )}
    </div>
  );
}
