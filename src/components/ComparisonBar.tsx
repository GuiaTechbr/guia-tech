"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GitCompareArrows,
  Trash2,
} from "lucide-react";

import {
  clearComparison,
  useComparison,
} from "@/lib/comparison";

export default function ComparisonBar() {
  const pathname = usePathname();
  const { ids, ready } = useComparison();

  if (
    !ready ||
    ids.length === 0 ||
    pathname.startsWith("/admin") ||
    pathname === "/comparar"
  ) {
    return null;
  }

  const podeComparar = ids.length >= 2;
  const compararHref = `/comparar?ids=${ids.join(",")}`;

  return (
    <>
      <div aria-hidden="true" className="h-40 sm:h-28" />
    <div
      aria-live="polite"
      className={`fixed ${pathname.startsWith("/produtos/") ? "bottom-36 lg:bottom-4" : "bottom-4"} left-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2`}
    >
      <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl sm:flex border border-blue-200 bg-slate-950/95 p-3 text-white shadow-2xl backdrop-blur-md sm:p-4">
        <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 sm:flex">
          <GitCompareArrows
            aria-hidden="true"
            size={20}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">
            Comparação
          </p>

          <p className="text-xs text-slate-300">
            {ids.length} de 3 produtos selecionados
          </p>
        </div>

        <button
          type="button"
          onClick={clearComparison}
          aria-label="Limpar comparação"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
        >
          <Trash2
            aria-hidden="true"
            size={18}
          />
        </button>

        {podeComparar ? (
          <Link
            href={compararHref}
            className="col-span-2 text-center shrink-0 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:px-5 sm:text-sm"
          >
            Comparar agora
          </Link>
        ) : (
          <div
            aria-disabled="true"
            className="col-span-2 text-center shrink-0 cursor-not-allowed rounded-xl bg-slate-700 px-3 py-2.5 text-xs font-bold text-slate-300 sm:px-5 sm:text-sm"
          >
            Selecione mais 1
          </div>
        )}
      </div>
    </div>
    </>
  );
}