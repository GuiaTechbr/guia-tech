"use client";

import { useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";

export type ProdutoComparacao = {
  id: number; nome: string; marca: string; categoria: string; preco: number | null;
  fichaTecnica: string | null; pontosPositivos: string | null; pontosAtencao: string | null;
};
function linhas(texto: string | null) {
  return texto?.split("\n").map((linha) => linha.trim()).filter(Boolean) ?? [];
}
function especificacoes(texto: string | null) {
  const resultado = new Map<string, { titulo: string; valor: string }>();
  for (const linha of linhas(texto)) {
    const separador = linha.indexOf(":");
    const titulo = separador > 0 ? linha.slice(0, separador).trim() : "Outras informações";
    const valor = separador > 0 ? linha.slice(separador + 1).trim() : linha;
    const chave = titulo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const anterior = resultado.get(chave);
    resultado.set(chave, { titulo, valor: anterior ? anterior.valor + "; " + valor : valor });
  }
  return resultado;
}
function lista(texto: string | null) {
  const itens = linhas(texto);
  return itens.length ? <ul className="list-disc space-y-2 pl-4">{itens.map((item, index) => <li key={index}>{item}</li>)}</ul> : "Não informado";
}

export default function ProductComparison({ produtos, initialIds }: { produtos: ProdutoComparacao[]; initialIds: number[] }) {
  const [ids, setIds] = useState<(number | null)[]>([initialIds[0] ?? null, initialIds[1] ?? null, initialIds[2] ?? null]);
  const selecionados = ids.flatMap((id) => produtos.filter((produto) => produto.id === id));
  const fichas = selecionados.map((produto) => especificacoes(produto.fichaTecnica));
  const campos = new Map<string, string>();
  fichas.forEach((ficha) => ficha.forEach((campo, chave) => campos.set(chave, campo.titulo)));
  function linha(titulo: string, valores: ReactNode[]) {
    return <tr key={titulo} className="border-t border-slate-200">
      <th scope="row" className="w-40 bg-slate-50 p-4 text-left align-top font-semibold text-slate-700">{titulo}</th>
      {valores.map((valor, index) => <td key={selecionados[index].id} className="p-4 align-top text-slate-600">{valor}</td>)}
    </tr>;
  }
  return (
    <>
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-3">
        {ids.map((id, index) => <div key={index} className="min-w-0">
          <label htmlFor={"comparar-" + index} className="mb-2 block text-sm font-semibold text-slate-700">Produto {index + 1}{index === 2 ? " (opcional)" : ""}</label>
          <select id={"comparar-" + index} value={id ?? ""} onChange={(event) => {
            const novoId = event.target.value ? Number(event.target.value) : null;
            setIds((atuais) => atuais.map((atual, posicao) => posicao === index ? novoId : atual));
          }} className="w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 focus:outline-blue-600">
            <option value="">Escolha um produto</option>
            {produtos.filter((produto) => produto.id === id || !ids.includes(produto.id)).map((produto) => <option key={produto.id} value={produto.id}>{produto.nome}</option>)}
          </select>
        </div>)}
        <button type="button" disabled={selecionados.length === 0} onClick={() => setIds([null, null, null])} className="w-fit rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50">Limpar comparação</button>
      </div>
      <p role="status" className="my-5 text-sm text-slate-600">{selecionados.length} de 3 produtos selecionados. {selecionados.length < 2 ? "Escolha pelo menos dois para comparar." : "No celular, deslize a tabela para ver todas as colunas."}</p>
      {selecionados.length >= 2 && <>
        {new Set(selecionados.map((produto) => produto.categoria)).size > 1 && <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Você selecionou categorias diferentes. Alguns recursos podem não ser equivalentes.</p>}
        <div role="region" aria-label="Tabela de comparação de produtos" tabIndex={0} className="overflow-x-auto rounded-2xl border border-slate-200 bg-white focus:outline-blue-600">
          <table className="w-full min-w-[640px] table-fixed text-sm">
            <caption className="sr-only">Comparação de preços e características dos produtos selecionados</caption>
            <thead><tr>
              <th scope="col" className="w-40 p-4 text-left text-slate-700">Características</th>
              {selecionados.map((produto) => <th key={produto.id} scope="col" className="p-4 text-left align-top">
                <p className="break-words text-base font-bold text-slate-900">{produto.nome}</p>
                <Link href={"/produtos/" + produto.id} className="mt-3 inline-flex rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">Ver produto →</Link>
              </th>)}
            </tr></thead>
            <tbody>
              {linha("Marca", selecionados.map((produto) => produto.marca))}
              {linha("Categoria", selecionados.map((produto) => produto.categoria))}
              {linha("Preço encontrado", selecionados.map((produto) => produto.preco === null ? "Consulte na loja" : produto.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })))}
              {Array.from(campos).map(([chave, titulo]) => linha("Ficha técnica · " + titulo, fichas.map((ficha) => ficha.get(chave)?.valor || "Não informado")))}
              {linha("Pontos positivos", selecionados.map((produto) => lista(produto.pontosPositivos)))}
              {linha("Pontos de atenção", selecionados.map((produto) => lista(produto.pontosAtencao)))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-500">Informações cadastradas no Guia Tech. Preços e disponibilidade podem mudar; confirme os detalhes na loja antes de comprar.</p>
      </>}
      {produtos.length < 2 && <p className="mt-4 text-slate-600">Ainda não há produtos suficientes no catálogo para comparar. <Link href="/ofertas" className="font-semibold text-blue-700 underline">Explorar ofertas</Link></p>}
    </>
  );
}
