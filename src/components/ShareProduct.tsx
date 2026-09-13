"use client";

import { useState } from "react";
import { Copy, Share2 } from "lucide-react";
import { SITE_URL } from "@/lib/site";

export default function ShareProduct({ id, nome }: { id: number; nome: string }) {
  const [mensagem, setMensagem] = useState("");
  const [manual, setManual] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const url = SITE_URL + "/produtos/" + id;

  async function copiar() {
    setMensagem("");
    setManual(false);
    try {
      await navigator.clipboard.writeText(url);
      setMensagem("Link copiado! Cole na conversa de sua preferência.");
    } catch {
      setManual(true);
      setMensagem("Selecione e copie o endereço abaixo.");
    }
  }

  async function compartilhar() {
    setOcupado(true);
    setMensagem("");
    setManual(false);
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: nome + " | Guia Tech", url });
      } else {
        await copiar();
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError")) {
        setManual(true);
        setMensagem("O compartilhamento não está disponível. Você pode copiar o endereço abaixo.");
      }
    } finally {
      setOcupado(false);
    }
  }

  const estilo = "flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50";
  return (
    <div className="mt-2">
      <div className="grid gap-2 sm:grid-cols-2">
        <button type="button" disabled={ocupado} onClick={compartilhar} className={estilo}><Share2 size={16} aria-hidden="true" />Compartilhar</button>
        <button type="button" disabled={ocupado} onClick={copiar} className={estilo}><Copy size={16} aria-hidden="true" />Copiar link</button>
      </div>
      <p role="status" aria-live="polite" className="mt-2 text-sm text-slate-600">{mensagem}</p>
      {manual && <div className="mt-2">
        <label htmlFor="produto-link" className="mb-1 block text-xs font-semibold text-slate-600">Link do produto</label>
        <input id="produto-link" readOnly value={url} onFocus={(event) => event.currentTarget.select()} className="w-full min-w-0 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-blue-600" />
      </div>}
    </div>
  );
}
