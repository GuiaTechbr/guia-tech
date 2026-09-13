"use client";

import Link from "next/link";

export default function ErrorPage({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-12">
    <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-semibold tracking-widest text-blue-600">GUIA TECH</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-950">Não foi possível carregar esta página</h1>
      <p className="mt-4 leading-7 text-slate-600">Pode ser uma falha temporária. Tente novamente em alguns instantes.</p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <button type="button" onClick={() => unstable_retry()} className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Tentar novamente</button>
        <Link href="/" className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">Voltar ao início</Link>
      </div>
    </div>
  </main>;
}
