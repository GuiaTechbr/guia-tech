import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./CategoryDesign.module.css";
import { APPLIANCES, grupoEletro } from "@/lib/appliances";

type Produto = {
  id: number; nome: string; marca: string; categoria: string;
  imagem: string | null; fichaTecnica?: string | null;
};
const nomes: Record<string, string> = {
  Smartphone: "smartphones", Notebook: "notebooks", "Smart TV": "Smart TVs",
  Games: "produtos para games", "Casa Inteligente": "dispositivos de casa inteligente",
  Wearables: "wearables", "TV e Streaming": "TVs e dispositivos de streaming", "Acessórios": "acessórios",
};

// O resumo usa somente campos cadastrados; não deduz especificações do modelo.
function resumoTecnico(ficha: string | null | undefined) {
  if (!ficha?.trim()) return "";
  return ficha.split(/\r?\n/).map(linha => linha.trim()).filter(linha => Boolean(linha) && !/^(marca|modelo|nome):/i.test(linha))
    .slice(0, 3).map(linha => linha.replace(/^[-•]\s*/, "")).join(" · ");
}

export default function CategoryComparison({ categoria, produtos }: {
  categoria: string; produtos: Produto[];
}) {
  // Preserva a seleção e a ordem existentes na consulta da categoria.
  const grupos = new Map<string, Produto[]>();
  if (categoria === APPLIANCES) produtos.forEach(produto => {
    const grupo = grupoEletro(produto);
    if (grupo) grupos.set(grupo, [...(grupos.get(grupo) ?? []), produto]);
  });
  const selecionados = categoria === APPLIANCES
    ? (Array.from(grupos.values()).find(grupo => grupo.length >= 2) ?? []).slice(0, 3)
    : produtos.filter(produto => produto.categoria === categoria).slice(0, 3);
  const podeComparar = selecionados.length >= 2;
  return (
    <section aria-labelledby="comparacao-categoria-titulo" className={styles.comparison} data-eletro-empty={categoria === APPLIANCES && selecionados.length === 0 ? "true" : undefined}>
      <div className={styles.copy}>
        <p className={styles.badge}>COMPARADOR GUIA TECH</p>
        <h2 id="comparacao-categoria-titulo">Compare {nomes[categoria] ?? categoria} lado a lado e faça a melhor escolha.</h2>
        <p className={styles.comparisonDescription}>{categoria === APPLIANCES ? "Compare modelos do mesmo tipo usando capacidade, consumo, dimensões e outros dados cadastrados. Escolha sua subcategoria nos filtros abaixo." : "Analise especificações, veja as diferenças e encontre o modelo ideal para o seu uso."}</p>
        {podeComparar ? <Link href={`/comparar?ids=${selecionados.map(produto => produto.id).join(",")}`} prefetch={false} className={styles.button}>Comparar agora <ArrowRight size={22} aria-hidden="true" /></Link>
          : <button disabled className={styles.button}>Comparar agora <ArrowRight size={22} aria-hidden="true" /></button>}
        {selecionados.length < 3 && <p className={styles.availability}>{categoria === APPLIANCES ? "A comparação requer ao menos dois modelos com a mesma subcategoria e o mesmo tipo de produto cadastrados." : podeComparar ? "Esta categoria tem dois produtos cadastrados. Você já pode comparar os dois lado a lado." : "A comparação ficará disponível quando houver pelo menos dois produtos cadastrados nesta categoria."}</p>}
      </div>
      {selecionados.length > 0 && <div className={styles.products}>
        {selecionados.map((produto, index) => {
          const resumo = resumoTecnico(produto.fichaTecnica);
          return <div key={produto.id} className={styles.productWrap}>
            {index > 0 && <span aria-hidden="true" className={styles.vs}>VS</span>}
            <article className={styles.product}>
              <div className={styles.productImage}>{produto.imagem ? <Image src={produto.imagem} alt={produto.nome} width={280} height={180} unoptimized /> : <span>Imagem não cadastrada</span>}</div>
              <div className={styles.productInfo}><h3>{produto.nome}</h3>
              {resumo && <p className={styles.spec}>{resumo}</p>}
              <p className={styles.brand}>{produto.marca}</p></div>
            </article>
          </div>;
        })}
      </div>}
    </section>
  );
}
