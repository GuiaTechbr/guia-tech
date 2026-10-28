import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Percent } from "lucide-react";
import prisma from "@/lib/prisma";
import styles from "./HomeHighlights.module.css";

// Reuse the approved artwork without including its sample text, prices or ratings.
function ReferenceArt({ x, y, width, height, className = "" }: { x: number; y: number; width: number; height: number; className?: string }) {
  return <div aria-hidden="true" className={`${styles.art} ${className}`} style={{ aspectRatio: `${width}/${height}`, maxWidth: `${width}px` }}><Image src="/images/topo-guiatech-aprovado.png" alt="" width={1672} height={941} sizes="1672px" className={styles.artImage} style={{ width: `${1672 / width * 100}%`, left: `${-x / width * 100}%`, top: `${-y / height * 100}%` }} /></div>;
}

const stores = [
  { name: "amazon", x: 319, width: 76 },
  { name: "Magazine Luiza", x: 430, width: 106 },
  { name: "mercado livre", x: 568, width: 111 },
  { name: "KaBuM!", x: 706, width: 76 },
  { name: "americanas", x: 830, width: 105 },
  { name: "CASAS BAHIA", x: 965, width: 127 },
  { name: "shopee", x: 1138, width: 100 },
  { name: "extra", x: 1282, width: 65 },
];

export default async function HomeHighlights() {
  const products = await prisma.produto.findMany({ where: { categoria: "Smartphone", imagem: { not: null } }, take: 3, orderBy: [{ criadoEm: "desc" }, { id: "desc" }], select: { id: true, nome: true, imagem: true, marca: true } });
  const compareHref = products.length >= 2 ? `/comparar?ids=${products.map(p => p.id).join(",")}` : "/comparar";
  return <section className={styles.section} aria-labelledby="home-highlights-title">
    <div className={styles.inner}>
      <div className={styles.heading}>
        <div><h2 id="home-highlights-title">Compare e encontre ofertas</h2><p>Explore produtos de todas as categorias para fazer a melhor escolha.</p></div>
        <Link href="#destaques">Ver todos os destaques <ArrowRight size={15} aria-hidden="true" /></Link>
      </div>
      <div className={styles.stores} aria-label="Lojas de tecnologia">
        <p>Encontre tecnologia nas principais lojas:</p>
        <ul>{stores.map(store => <li key={store.name}><span className="sr-only">{store.name}</span><ReferenceArt x={store.x} y={654} width={store.width} height={38} /></li>)}</ul>
        <Link href="/ofertas">Ver ofertas <ArrowRight size={15} aria-hidden="true" /></Link>
      </div>
      <div className={styles.banners}>
        <div className={styles.comparison}>
          <div className={styles.comparisonCopy}><span className={styles.badge}>Comparador Guia Tech</span><h2>Compare produtos lado a lado<br /> e faça a melhor escolha.</h2><p>Analise especificações, veja as diferenças e encontre o modelo ideal para o seu uso.</p><Link href={compareHref} className={styles.button}>Comparar agora <ArrowRight size={15} aria-hidden="true" /></Link></div>
          <div className={styles.products}>{products.map((p, index) => <div className={styles.productWrap} key={p.id}><Link href={`/produtos/${p.id}`} className={styles.product}>{p.imagem && <Image src={p.imagem} alt="" width={100} height={90} unoptimized />}<strong>{p.nome}</strong><span>{p.marca}</span></Link>{index < products.length - 1 && <span className={styles.vs} aria-hidden="true">VS</span>}</div>)}</div>
        </div>
        <Link href="/ofertas" className={styles.offers}>
          <span className={styles.percent}><Percent size={22} aria-hidden="true" /></span>
          <div className={styles.offerCopy}><span className={styles.offerBadge}>Ofertas em destaque</span><h2>As melhores ofertas<br /> em tecnologia.</h2><p>Confira os preços de smartphones, notebooks, TVs e mais.</p><span className={styles.whiteButton}>Ver ofertas <ArrowRight size={15} aria-hidden="true" /></span></div>
          <ReferenceArt x={1336} y={703} width={294} height={157} className={styles.offerArt} />
        </Link>
      </div>
    </div>
  </section>;
}
