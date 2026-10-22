"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Heart, Menu, Tag, X } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import styles from "./Top.module.css";

const links = [["Início", "/"], ["Smartphones", "/categoria/Smartphone"], ["Notebooks", "/categoria/Notebook"], ["Smart TVs", "/categoria/Smart%20TV"], ["Games", "/categoria/Games"]];
export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false);
  const pathname = usePathname();
  const fecharMenu = () => setMenuAberto(false);
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.logo} onClick={fecharMenu}><strong>Guia Tech</strong><span>Tecnologia, ofertas e análises</span></Link>
        <div className={styles.desktopSearch}><SearchBar /></div>
        <nav className={styles.desktopNav} aria-label="Menu principal">
          {links.map(([label, href]) => <Link key={href} href={href} aria-current={pathname === decodeURIComponent(href) ? "page" : undefined}>{label}</Link>)}
          <Link href="/ofertas" className={styles.offer}><Tag size={17} aria-hidden="true" />Ofertas</Link>
        </nav>
        <div className={styles.headerActions}>
          <Link href="/favoritos" className={styles.favorites}><Heart size={19} aria-hidden="true" /><span>Favoritos</span></Link>
          <button type="button" className={styles.menuToggle} onClick={() => setMenuAberto(!menuAberto)} aria-label={menuAberto ? "Fechar menu" : "Abrir menu"} aria-expanded={menuAberto} aria-controls="menu-mobile">{menuAberto ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </div>
      <div className={styles.mobileSearch}><SearchBar /></div>
      {menuAberto && <nav id="menu-mobile" className={styles.mobileNav} aria-label="Menu principal móvel" onKeyDown={(event) => { if (event.key === "Escape") fecharMenu(); }}>{links.map(([label, href]) => <Link key={href} href={href} onClick={fecharMenu}>{label}</Link>)}<Link href="/ofertas" onClick={fecharMenu}>Ofertas</Link></nav>}
    </header>
  );
}

