"use client";

import { useState } from "react";
import { GitCompareArrows } from "lucide-react";
import {
  toggleComparison,
  useComparison,
} from "@/lib/comparison";

export default function ComparisonButton({
  id,
  nome,
}: {
  id: number;
  nome: string;
}) {
  const { ids, ready } = useComparison();
  const [erro, setErro] = useState("");

  const selecionado = ids.includes(id);

  function alternarComparacao() {
    const resultado = toggleComparison(id);

    if (resultado === "limit") {
      setErro("Limite de 3 produtos.");
      return;
    }

    setErro("");
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        disabled={!ready}
        aria-pressed={selecionado}
        aria-label={
          selecionado
            ? `Remover ${nome} da comparação`
            : `Adicionar ${nome} à comparação`
        }
        onClick={alternarComparacao}
        className={`flex min-h-11 w-full items-center justify-center gap-1 rounded-lg border px-1 py-2 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 sm:gap-2 sm:text-sm ${
          selecionado
            ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
            : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
        }`}
      >
        <GitCompareArrows
          aria-hidden="true"
          size={16}
          className="shrink-0"
        />

        {selecionado ? "Comparando" : "Comparar"}
      </button>

      {erro && (
        <p
          role="alert"
          className="mt-1 text-center text-[10px] font-medium text-amber-700"
        >
          {erro}
        </p>
      )}
    </div>
  );
}