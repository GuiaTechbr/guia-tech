import Image from "next/image";
import Link from "next/link";
import { GitCompareArrows, Grid2X2, Scale, Star, Tag, Zap } from "lucide-react";
import styles from "./Top.module.css";

export default function HomeHero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.heroContent}>
        <span className={styles.eyebrow}>Seu guia de tecnologia</span>
        <h1 id="hero-title">Encontre a tecnologia<br className={styles.desktopBreak} /> certa <span>para você.</span></h1>
        <p className={styles.description}>Explore produtos, compare especificações, confira os pontos<br className={styles.wideBreak} /> positivos e de atenção e veja as ofertas nas lojas parceiras.</p>
        <div className={styles.heroActions}>
          <Link href="#destaques" className={styles.primary}><Star size={20} aria-hidden="true" />Conhecer os destaques ↓</Link>
          <Link href="/comparar"><GitCompareArrows size={20} aria-hidden="true" />Comparar produtos</Link>
          <Link href="#categorias"><Grid2X2 size={20} aria-hidden="true" />Explorar categorias</Link>
        </div>
        <ul className={styles.benefits}>
          <li><i><Zap aria-hidden="true" /></i><div><strong>Informações completas</strong><span>Em um só lugar</span></div></li>
          <li><i><Scale aria-hidden="true" /></i><div><strong>Compare até 3 modelos</strong><span>com facilidade</span></div></li>
          <li><i><Tag aria-hidden="true" /></i><div><strong>Veja as melhores ofertas</strong><span>nas lojas parceiras</span></div></li>
        </ul>
      </div>
      <div className={styles.heroArt}>
        {/* Only the approved banner artwork is visible; lower reference sections are clipped. */}
        <Image src="/images/topo-guiatech-aprovado.png" alt="Monitor 4K com montanhas, notebook, smartphones, controle de videogame, fones e smartwatch. Tecnologia para uma vida mais incrível. Guias e análises para decisões mais inteligentes." width={1672} height={941} sizes="(max-width: 900px) 200vw, 100vw" preload className={styles.artImage} />
      </div>
    </section>
  );
}
