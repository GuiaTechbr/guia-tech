import { APPLIANCES } from "@/lib/appliances";
import Image from "next/image";
import Link from "next/link";
import styles from "./CategoryDesign.module.css";

const artes: Record<string, { nome: string; arquivo: string }> = {
  Smartphone: { nome: "Smartphones", arquivo: "smartphone" },
  Notebook: { nome: "Notebooks", arquivo: "notebook" },
  "Smart TV": { nome: "Smart TVs", arquivo: "smart-tv" },
  Games: { nome: "Games", arquivo: "games" },
  "Casa Inteligente": { nome: "Casa Inteligente", arquivo: "casa" },
  Wearables: { nome: "Wearables", arquivo: "wearables" },
  "TV e Streaming": { nome: "TV e Streaming", arquivo: "streaming" },
  "Acessórios": { nome: "Acessórios", arquivo: "acessorios" },
  [APPLIANCES]: { nome: APPLIANCES, arquivo: "eletrodomesticos" },
};

export default function CategoryHero({ categoria, quantidade, descricao }: {
  categoria: string; quantidade: number; descricao: string;
}) {
  const arte = artes[categoria];
  const nome = arte?.nome ?? categoria;
  return (
    <section className={styles.hero} data-category={categoria === APPLIANCES ? "eletro" : undefined}>
      {arte && <div className={styles.art} data-art={arte.arquivo} aria-hidden="true">
        {/* Exibe somente a composição do banner aprovado. O texto é conteúdo real da página. */}
        <picture>
          {categoria === APPLIANCES && <source media="(max-width:640px)" srcSet="/categorias/eletrodomesticos-ambiente-mobile.webp" />}
        <Image src={categoria === APPLIANCES ? "/categorias/eletrodomesticos-ambiente.webp" : `/categorias/aprovadas/${arte.arquivo}.png`} alt="" width={categoria === APPLIANCES ? 2171 : 1672} height={categoria === APPLIANCES ? 724 : 941} priority unoptimized />
        </picture>
      </div>}
      <div className={styles.heroInner}>
        <nav aria-label="Localização na página" className={styles.breadcrumb}>
          <Link href="/">Início</Link><span aria-hidden="true">›</span><span aria-current="page">{nome}</span>
        </nav>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Categoria</p>
          <h1>{nome}</h1>
          <p className={styles.description}>{quantidade === 0 ? "Ainda não há produtos cadastrados nesta categoria. Novas seleções serão adicionadas em breve." : descricao}</p>
        </div>
      </div>
    </section>
  );
}
