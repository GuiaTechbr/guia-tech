"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [busca, setBusca] = useState("");
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const termo = busca.trim();

    if (!termo) {
      return;
    }

    router.push(`/busca?q=${encodeURIComponent(termo)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full"
    >
      <div className="flex overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">

        <div className="flex flex-1 items-center">
          <span className="pl-4 text-lg text-zinc-400">
            🔎
          </span>

          <input
            type="search"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="O que você está procurando?"
            aria-label="Buscar produtos"
            className="min-w-0 flex-1 bg-transparent px-3 py-2s text-sm text-zinc-900 outline-none placeholder:text-zinc-400 sm:text-base"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:px-7"
        >
          Buscar
        </button>

      </div>

      <p className="mt-2 text-center text-xs text-zinc-500">
        Ex.: iPhone, Samsung, notebook, Smart TV...
      </p>
    </form>
  );
}