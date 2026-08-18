"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false);

  const fecharMenu = () => {
    setMenuAberto(false);
  };

  return (
    <header className="border-b border-blue-100 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5 lg:px-8">

        {/* LOGO */}
        <Link href="/" className="group" onClick={fecharMenu}>
          <h1 className="text-2xl font-bold text-blue-700 transition group-hover:text-blue-800 sm:text-3xl">
            🚀 Guia Tech
          </h1>

          <p className="text-xs text-zinc-500 sm:text-sm">
            Tecnologia, ofertas e análises
          </p>
        </Link>

        {/* BOTÃO DO MENU MOBILE */}
        <button
          type="button"
          onClick={() => setMenuAberto(!menuAberto)}
          className="rounded-lg border border-blue-200 bg-blue-50 p-2 text-blue-700 transition hover:bg-blue-100 md:hidden"
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuAberto}
        >
          {menuAberto ? (
            <span className="text-2xl leading-none">✕</span>
          ) : (
            <span className="text-2xl leading-none">☰</span>
          )}
        </button>

        {/* MENU DESKTOP */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-5 text-sm font-medium text-zinc-700 lg:gap-6">

            <li>
              <Link
                href="/"
                className="transition hover:text-blue-700"
              >
                Início
              </Link>
            </li>

            <li>
              <Link
                href="/categoria/Smartphone"
                className="transition hover:text-blue-700"
              >
                Smartphones
              </Link>
            </li>

            <li>
              <Link
                href="/categoria/Notebook"
                className="transition hover:text-blue-700"
              >
                Notebooks
              </Link>
            </li>

            <li>
              <Link
                href="/categoria/Smart%20TV"
                className="transition hover:text-blue-700"
              >
                Smart TVs
              </Link>
            </li>

            <li>
              <Link
                href="/categoria/Games"
                className="transition hover:text-blue-700"
              >
                Games
              </Link>
            </li>

            <li>
              <Link
                href="/ofertas"
                className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-red-700 hover:shadow-md"
              >
                🔥 Ofertas
              </Link>
            </li>

          </ul>
        </nav>
      </div>

      {/* MENU MOBILE */}
      {menuAberto && (
        <nav className="border-t border-blue-100 bg-blue-50/60 md:hidden">
          <ul className="mx-auto max-w-7xl px-4 py-3 sm:px-6">

            <li>
              <Link
                href="/"
                onClick={fecharMenu}
                className="block border-b border-blue-100 py-3 font-medium text-zinc-700 transition hover:text-blue-700"
              >
                Início
              </Link>
            </li>

            <li>
              <Link
                href="/categoria/Smartphone"
                onClick={fecharMenu}
                className="block border-b border-blue-100 py-3 font-medium text-zinc-700 transition hover:text-blue-700"
              >
                Smartphones
              </Link>
            </li>

            <li>
              <Link
                href="/categoria/Notebook"
                onClick={fecharMenu}
                className="block border-b border-blue-100 py-3 font-medium text-zinc-700 transition hover:text-blue-700"
              >
                Notebooks
              </Link>
            </li>

            <li>
              <Link
                href="/categoria/Smart%20TV"
                onClick={fecharMenu}
                className="block border-b border-blue-100 py-3 font-medium text-zinc-700 transition hover:text-blue-700"
              >
                Smart TVs
              </Link>
            </li>

            <li>
              <Link
                href="/categoria/Games"
                onClick={fecharMenu}
                className="block border-b border-blue-100 py-3 font-medium text-zinc-700 transition hover:text-blue-700"
              >
                Games
              </Link>
            </li>

            <li className="pt-3">
              <Link
                href="/ofertas"
                onClick={fecharMenu}
                className="block rounded-lg bg-red-600 px-4 py-3 text-center font-semibold text-white shadow-sm transition hover:bg-red-700"
              >
                🔥 Ofertas
              </Link>
            </li>

          </ul>
        </nav>
      )}
    </header>
  );
}