"use client";
import { useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { normalizarBusca, type ProdutoIndice } from "@/lib/comparison-products";
import styles from "./ProductComparison.module.css";

const TAMANHO_PAGINA = 20;
export default function ComparisonProductSearch({ index, produtos, selecionado, bloqueados, onSelect }: {
  index: number; produtos: ProdutoIndice[]; selecionado?: ProdutoIndice;
  bloqueados: (number | null)[]; onSelect: (id: number | null) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(0);
  const [ativo, setAtivo] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const opcoes = useRef<(HTMLLIElement | null)[]>([]);
  const indice = useMemo(() => produtos.map(produto => ({ produto, texto: normalizarBusca(`${produto.nome} ${produto.marca}`) })), [produtos]);
  const termos = normalizarBusca(busca).split(" ").filter(Boolean);
  const encontrados = indice.filter(({ produto, texto }) =>
    (produto.id === selecionado?.id || !bloqueados.includes(produto.id)) && termos.every(termo => texto.includes(termo)));
  const visiveis = encontrados.slice(pagina * TAMANHO_PAGINA, (pagina + 1) * TAMANHO_PAGINA);
  const campoId = `comparar-${index}`;
  const listaId = `${campoId}-sugestoes`;
  function abrir() { setAberto(true); setBusca(""); setPagina(0); setAtivo(-1); }
  function escolher(id: number | null) { onSelect(id); setAberto(false); setBusca(""); setAtivo(-1); }
  function mover(posicao: number) {
    setAtivo(posicao);
    opcoes.current[posicao]?.scrollIntoView({ block: "nearest" });
  }
  return <div className={styles.searchField} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) { setAberto(false); setBusca(""); }
  }}>
    <label htmlFor={campoId}>Produto {index + 1}{index === 2 ? " (opcional)" : ""}</label>
    <div className={styles.searchInput}>
      <Search size={17} aria-hidden="true" />
      <input ref={input} id={campoId} role="combobox" aria-autocomplete="list" aria-haspopup="listbox"
        aria-expanded={aberto} aria-controls={aberto ? listaId : undefined}
        aria-activedescendant={aberto && ativo >= 0 ? `${campoId}-opcao-${visiveis[ativo]?.produto.id}` : undefined}
        autoComplete="off" spellCheck={false} placeholder="Pesquisar nome, marca ou modelo"
        value={aberto ? busca : selecionado?.nome ?? ""}
        onFocus={() => { setAberto(true); setPagina(0); setAtivo(-1); }} onClick={() => setAberto(true)}
        onChange={event => { setBusca(event.target.value); setPagina(0); setAtivo(-1); setAberto(true); }}
        onKeyDown={event => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!aberto) { abrir(); return; }
            if (visiveis.length) mover(event.key === "ArrowDown" ? Math.min(ativo + 1, visiveis.length - 1) : Math.max(ativo - 1, 0));
          } else if (event.key === "Enter" && aberto) {
            event.preventDefault(); if (ativo >= 0 && visiveis[ativo]) escolher(visiveis[ativo].produto.id);
          } else if (event.key === "Escape") { event.preventDefault(); setAberto(false); setBusca(""); }
        }} />
      <button type="button" aria-label={`Abrir lista do Produto ${index + 1}`} aria-expanded={aberto}
        onMouseDown={event => event.preventDefault()} onClick={() => { if (aberto) setAberto(false); else { input.current?.focus(); abrir(); } }}><ChevronDown size={18} aria-hidden="true" /></button>
    </div>
    {aberto && <div className={styles.suggestions}>
      <p className={styles.searchCount} role="status">{encontrados.length ? `${encontrados.length} ${encontrados.length === 1 ? "produto encontrado" : "produtos encontrados"}` : "Nenhum produto encontrado"}</p>
      <ul key={`${pagina}:${busca}`} id={listaId} role="listbox" aria-label={`Sugestões para Produto ${index + 1}`}>
        {visiveis.map(({ produto }, posicao) => <li key={produto.id} id={`${campoId}-opcao-${produto.id}`}
          ref={elemento => { opcoes.current[posicao] = elemento; }} role="option" aria-selected={selecionado?.id === produto.id}
          className={ativo === posicao ? styles.activeOption : undefined}>
          <button type="button" tabIndex={-1} onMouseDown={event => event.preventDefault()} onClick={() => escolher(produto.id)}>
            <strong>{produto.nome}</strong><span>{produto.marca} · {produto.categoria}</span>
          </button>
        </li>)}
      </ul>
      {(encontrados.length > TAMANHO_PAGINA || selecionado) && <div className={styles.searchActions}>
        {selecionado && <button type="button" onClick={() => escolher(null)}>Remover seleção</button>}
        {pagina > 0 && <button type="button" onClick={() => { setPagina(pagina - 1); setAtivo(-1); }}>Anteriores</button>}
        {(pagina + 1) * TAMANHO_PAGINA < encontrados.length && <button type="button" onClick={() => { setPagina(pagina + 1); setAtivo(-1); }}>Mais resultados</button>}
      </div>}
    </div>}
  </div>;
}



