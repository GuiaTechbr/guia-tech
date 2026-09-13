"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite, useFavorites } from "@/lib/favorites";

export default function FavoriteButton({ id, nome }: { id: number; nome: string }) {
  const { ids, ready } = useFavorites();
  const [erro, setErro] = useState(false);
  const salvo = ids.includes(id);
  return (
    <div className="mt-2">
      <button type="button" disabled={!ready} aria-pressed={salvo} aria-label={`${salvo ? "Remover dos" : "Adicionar aos"} favoritos: ${nome}`} onClick={() => {
        try { toggleFavorite(id); setErro(false); } catch { setErro(true); }
      }} className="flex min-h-11 w-full items-center justify-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-1 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 sm:gap-2 sm:text-sm">
        <Heart aria-hidden="true" size={16} className="shrink-0" fill={salvo ? "currentColor" : "none"} />
        {salvo ? "Salvo" : "Favoritar"}
      </button>
      {erro && <p role="alert" className="mt-2 text-xs text-red-700">Não foi possível salvar. Verifique se o navegador permite armazenar dados.</p>}
    </div>
  );
}
