"use client";

import Link from "next/link";
import { useState } from "react";
import SearchBar from "@/components/SearchBar";

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false);

  const fecharMenu = () => {
    setMenuAberto(false);
  };

  return (
    <header
      className="border-b border-blue-100 bg-cover bg-center shadow-sm"
      style={{ backgroundImage: "url('/banner-tech.jpg')" }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">

        {/* LOGO */}
        <Link href="/" className="shrink-0 group" onClick={fecharMenu}>
          <p className="text-2xl font-bold tracking-tight text-blue-700 transition-colors duration-300 group-hover:text-blue-800 sm:text-3xl">
            Guia Tech
          </p>

          <p className="mt-0.5 hidden text-xs text-slate-500 sm:block sm:text-sm">
            Tecnologia, ofertas e análises
          </p>
        </Link>

        {/* BUSCA DESKTOP */}
        <div className="hidden min-w-0 w-full max-w-md xl:block">
          <SearchBar />
        </div>

        {/* MENU DESKTOP */}
        <nav className="hidden xl:block">
          <ul className="flex items-center gap-4 text-sm font-medium text-slate-700 lg:gap-5">

            <li>
              <Link
                href="/"
                className="transition-colors duration-300 hover:text-blue-700"
              >
                Início
              </Link>
            </li>

            <li>
              <Link
                href="/categoria/Smartphone"
                className="transition-colors duration-300 hover:text-blue-700"
              >
                Smartphones
              </Link>
            </li>

            <li>
              <Link
                href="/categoria/Notebook"
                className="transition-colors duration-300 hover:text-blue-700"
              >
                Notebooks
              </Link>
            </li>

            <li>
              <Link
                href="/categoria/Smart%20TV"
                className="transition-colors duration-300 hover:text-blue-700"
              >
                Smart TVs
              </Link>
            </li>

            <li>
              <Link
                href="/categoria/Games"
                className="transition-colors duration-300 hover:text-blue-700"
              >
                Games
              </Link>
            </li>

            <li>
              <Link
                href="/ofertas"
                className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[0_8px_20px_rgba(37,99,235,0.18)]"
              >
                Ofertas
              </Link>
            </li>

          </ul>
        </nav>

        <Link href="/favoritos" className="shrink-0 rounded-lg border border-blue-200 bg-white/90 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">Favoritos</Link>

        {/* BOTÃO MENU MOBILE */}
        <button
          type="button"
          onClick={() => setMenuAberto(!menuAberto)}
          className="rounded-lg border border-blue-200 bg-white/80 p-2 text-blue-700 shadow-sm transition hover:bg-blue-50 xl:hidden"
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuAberto}
        >
          <span className="text-2xl leading-none">
            {menuAberto ? "×" : "☰"}
          </span>
        </button>

      </div>

      {/* BUSCA MOBILE */}
      <div className="px-4 pb-4 xl:hidden">
        <SearchBar />
      </div>

      {/* MENU MOBILE */}
      {menuAberto && (
        <nav className="border-t border-blue-100 bg-white/95 backdrop-blur xl:hidden">
          <ul className="mx-auto max-w-7xl px-4 py-3 sm:px-6">

            <li>
              <Link
                href="/"
                onClick={fecharMenu}
                className="block border-b border-slate-100 py-3 font-medium text-slate-700 transition hover:text-blue-700"
              >
                Início
              </Link>
            </li>

            <li>
              <Link
                href="/categoria/Smartphone"
                onClick={fecharMenu}
                className="block border-b border-slate-100 py-3 font-medium text-slate-700 transition hover:text-blue-700"
              >
                Smartphones
              </Link>
            </li>

            <li>
              <Link
                href="/categoria/Notebook"
                onClick={fecharMenu}
                className="block border-b border-slate-100 py-3 font-medium text-slate-700 transition hover:text-blue-700"
              >
                Notebooks
              </Link>
            </li>

            <li>
              <Link
                href="/categoria/Smart%20TV"
                onClick={fecharMenu}
                className="block border-b border-slate-100 py-3 font-medium text-slate-700 transition hover:text-blue-700"
              >
                Smart TVs
              </Link>
            </li>

            <li>
              <Link
                href="/categoria/Games"
                onClick={fecharMenu}
                className="block border-b border-slate-100 py-3 font-medium text-slate-700 transition hover:text-blue-700"
              >
                Games
              </Link>
            </li>

            <li className="pt-3">
              <Link
                href="/ofertas"
                onClick={fecharMenu}
                className="block rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Ofertas
              </Link>
            </li>

          </ul>
        </nav>
      )}
    </header>
  );
}