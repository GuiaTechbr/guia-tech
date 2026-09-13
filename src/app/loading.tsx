export default function Loading() {
  return <main aria-busy="true" className="min-h-[60vh] bg-slate-50 px-4 py-12">
    <div className="mx-auto max-w-7xl">
      <p role="status" className="mb-6 text-center font-semibold text-blue-700">Carregando o Guia Tech…</p>
      <div aria-hidden="true" className="grid grid-cols-2 gap-4 motion-safe:animate-pulse lg:grid-cols-3">
        {[0, 1, 2].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4"><div className="h-40 rounded-xl bg-slate-100" /><div className="mt-4 h-5 rounded bg-slate-100" /><div className="mt-3 h-4 w-2/3 rounded bg-slate-100" /></div>)}
      </div>
    </div>
  </main>;
}
