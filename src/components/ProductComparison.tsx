"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Battery, Camera, CheckCircle2, CircleDollarSign, Cpu, HardDrive, ImageOff, List, Monitor, Ruler, SlidersHorizontal, Tag, TriangleAlert, Weight, Wifi } from "lucide-react";
import ComparisonProductSearch from "./ComparisonProductSearch";
import { normalizarBusca, type ProdutoComparacao, type ProdutoIndice } from "@/lib/comparison-products";
import styles from "./ProductComparison.module.css";

function linhas(texto: string | null) {
  return texto?.split("\n").map(linha => linha.trim()).filter(Boolean) ?? [];
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
  return itens.length ? <ul className={styles.specList}>{itens.map((item, index) => <li key={index}>{item}</li>)}</ul> : "Não informado";
}
function icone(titulo: string) {
  const chave = normalizarBusca(titulo);
  if (chave === "marca") return Tag;
  if (chave === "categoria") return List;
  if (/preco/.test(chave)) return CircleDollarSign;
  if (/tela|painel|resolucao/.test(chave)) return Monitor;
  if (/armazenamento|ssd|disco/.test(chave)) return HardDrive;
  if (/memoria|ram|processador|chip/.test(chave)) return Cpu;
  if (/camera/.test(chave)) return Camera;
  if (/bateria|autonomia/.test(chave)) return Battery;
  if (/dimens|tamanho/.test(chave)) return Ruler;
  if (/peso/.test(chave)) return Weight;
  if (/conect|wi fi|bluetooth/.test(chave)) return Wifi;
  if (/positivos/.test(chave)) return CheckCircle2;
  if (/atencao/.test(chave)) return TriangleAlert;
  return SlidersHorizontal;
}
function FotoProduto({ produto }: { produto: ProdutoComparacao }) {
  const [indisponivel, setIndisponivel] = useState(false);
  return <div className={styles.productImage}>
    {produto.imagem && !indisponivel ? <Image src={produto.imagem} alt={produto.nome} width={280} height={180} unoptimized onError={() => setIndisponivel(true)} />
      : <span className={styles.imageFallback}><ImageOff size={28} aria-hidden="true" />Imagem indisponível</span>}
  </div>;
}

export default function ProductComparison({ produtos, initialIds, initialProdutos, categoriaContexto }: {
  produtos: ProdutoIndice[]; initialIds: number[]; initialProdutos: ProdutoComparacao[]; categoriaContexto?: string;
}) {
  const [ids, setIds] = useState<(number | null)[]>([initialIds[0] ?? null, initialIds[1] ?? null, initialIds[2] ?? null]);
  const [apenasDiferencas, setApenasDiferencas] = useState(false);
  const [dados, setDados] = useState<Record<number, ProdutoComparacao>>(() => Object.fromEntries(initialProdutos.map(produto => [produto.id, produto])));
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const indice = useMemo(() => new Map(produtos.map(produto => [produto.id, produto])), [produtos]);
  const opcoes = useMemo(() => categoriaContexto ? produtos.filter(produto => produto.categoria === categoriaContexto) : produtos, [produtos, categoriaContexto]);
  const selecionadosIndice = ids.flatMap(id => id !== null && indice.has(id) ? [indice.get(id)!] : []);
  const faltantes = selecionadosIndice.filter(produto => !dados[produto.id]).map(produto => produto.id).join(",");
  useEffect(() => {
    if (!faltantes) return;
    const controller = new AbortController();
    fetch(`/api/comparar/produtos?ids=${faltantes}`, { signal: controller.signal, cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error("Não foi possível carregar os produtos. Tente novamente.");
        const recebidos: ProdutoComparacao[] = await response.json();
        if (faltantes.split(",").some(id => !recebidos.some(produto => produto.id === Number(id)))) throw new Error("Um produto não está mais disponível. Escolha outro produto.");
        if (!controller.signal.aborted) setDados(atuais => ({ ...atuais, ...Object.fromEntries(recebidos.map(produto => [produto.id, produto])) }));
      })
      .catch(error => { if (!controller.signal.aborted) setErro(error instanceof Error ? error.message : "Não foi possível carregar os produtos."); });
    return () => controller.abort();
  }, [faltantes, tentativa]);
  function atualizarSelecao(novosIds: (number | null)[]) {
    const preenchidos = novosIds.filter(id => id !== null);
    if (new Set(preenchidos).size !== preenchidos.length) return;
    setIds(novosIds); setErro("");
    const url = new URL(window.location.href);
    if (categoriaContexto) url.searchParams.set("categoria", categoriaContexto);
    if (preenchidos.length) url.searchParams.set("ids", preenchidos.join(","));
    else url.searchParams.delete("ids");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }
  const selecionados = selecionadosIndice.flatMap(produto => dados[produto.id] ? [dados[produto.id]] : []);
  const fichas = selecionados.map(produto => especificacoes(produto.fichaTecnica));
  const campos = new Map<string, string>();
  fichas.forEach(ficha => ficha.forEach((campo, chave) => campos.set(chave, campo.titulo)));
  function linha(titulo: string, valores: ReactNode[], comparaveis = valores.map(String), chave = titulo) {
    const normalizados = comparaveis.map(valor => valor.trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR"));
    if (apenasDiferencas && normalizados.length > 1 && new Set(normalizados).size === 1) return null;
    const Icone = icone(titulo);
    return <tr key={chave}>
      <th scope="row"><span className={styles.rowLabel}><Icone size={17} aria-hidden="true" /><span>{titulo}</span></span></th>
      {valores.map((valor, index) => <td key={selecionados[index].id}>{valor}</td>)}
    </tr>;
  }
  const linhasTabela = [
    linha("Marca", selecionados.map(produto => produto.marca)),
    linha("Categoria", selecionados.map(produto => produto.categoria)),
    linha("Preço encontrado", selecionados.map(produto => produto.preco === null ? "Consulte na loja" : produto.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }))),
    ...Array.from(campos).filter(([chave]) => !(["marca", "categoria"].includes(chave) && fichas.every((ficha, index) => normalizarBusca(ficha.get(chave)?.valor ?? "") === normalizarBusca(chave === "marca" ? selecionados[index].marca : selecionados[index].categoria)))).map(([chave, titulo]) => linha(titulo, fichas.map(ficha => ficha.get(chave)?.valor || "Não informado"), undefined, `ficha:${chave}`)),
    linha("Pontos positivos", selecionados.map(produto => lista(produto.pontosPositivos)), selecionados.map(produto => linhas(produto.pontosPositivos).join("\n"))),
    linha("Pontos de atenção", selecionados.map(produto => lista(produto.pontosAtencao)), selecionados.map(produto => linhas(produto.pontosAtencao).join("\n"))),
  ];
  return <>
    <div className={styles.selectors}>
      {ids.map((id, index) => <ComparisonProductSearch key={index} index={index} produtos={opcoes} selecionado={id !== null ? indice.get(id) : undefined} bloqueados={ids}
        onSelect={novoId => atualizarSelecao(ids.map((atual, posicao) => posicao === index ? novoId : atual))} />)}
      <button type="button" disabled={selecionadosIndice.length === 0} onClick={() => { atualizarSelecao([null, null, null]); setApenasDiferencas(false); }} className={styles.clearButton}>Limpar comparação</button>
      {categoriaContexto && <p className={styles.context}>Pesquisando em {categoriaContexto}</p>}
    </div>
    <p role="status" className={styles.status}>{selecionadosIndice.length} de 3 produtos selecionados. {selecionadosIndice.length < 2 ? "Escolha pelo menos dois para comparar." : "No celular, deslize a tabela para ver todas as colunas."}</p>
    {faltantes && !erro && <p role="status" className={styles.loading}>Carregando informações dos produtos selecionados…</p>}
    {erro && <div role="alert" className={styles.error}>{erro} <button type="button" onClick={() => { setErro(""); setTentativa(atual => atual + 1); }}>Tentar novamente</button></div>}
    {selecionadosIndice.length >= 2 && !faltantes && <>
      <label className={styles.differences}>
        <input type="checkbox" checked={apenasDiferencas} onChange={event => setApenasDiferencas(event.target.checked)} />Mostrar apenas diferenças
      </label>
      {new Set(selecionados.map(produto => produto.categoria)).size > 1 && <p className={styles.warning}>Você selecionou categorias diferentes. Alguns recursos podem não ser equivalentes.</p>}
      <div role="region" aria-label="Tabela de comparação de produtos" tabIndex={0} className={styles.tableScroll}>
        <table className={styles.table} style={{ minWidth: selecionados.length === 3 ? 960 : 740 }}>
          <caption className="sr-only">Comparação de preços e características dos produtos selecionados</caption>
          <colgroup><col className={styles.characteristicColumn} />{selecionados.map(produto => <col key={produto.id} />)}</colgroup>
          <thead><tr>
            <th scope="col" className={styles.features}><span className={styles.badge}>COMPARAÇÃO DE PRODUTOS</span><h2>Características</h2><p>Veja lado a lado as principais especificações dos produtos selecionados.</p></th>
            {selecionados.map(produto => <th key={produto.id} scope="col" className={styles.productHeading}>
              <FotoProduto key={`${produto.id}:${produto.imagem}`} produto={produto} />
              <p className={styles.productName}>{produto.nome}</p>
              <Link href={`/produtos/${produto.id}`} className={styles.productLink}>Ver produto <ArrowRight size={17} aria-hidden="true" /></Link>
            </th>)}
          </tr></thead>
          <tbody>{linhasTabela}{linhasTabela.every(linha => linha === null) && <tr><td colSpan={selecionados.length + 1}>Nenhuma diferença nos campos cadastrados. Desmarque a opção para ver todas as informações.</td></tr>}</tbody>
        </table>
      </div>
      <p className={styles.note}>Informações cadastradas no Guia Tech. Preços e disponibilidade podem mudar; confirme os detalhes na loja antes de comprar.</p>
    </>}
    {produtos.length < 2 && <p className={styles.note}>Ainda não há produtos suficientes no catálogo para comparar. <Link href="/ofertas">Explorar ofertas</Link></p>}
  </>;
}

