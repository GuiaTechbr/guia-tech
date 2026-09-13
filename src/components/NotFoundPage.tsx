import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";

export default function NotFoundPage({ produto = false }: { produto?: boolean }) {
  return <>
    <Header />
    <main className="min-h-[60vh] bg-slate-50 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
        <p className="text-sm font-semibold tracking-widest text-blue-600">GUIA TECH · 404</p>
        <h1 className="mt-4 text-3xl font-bold text-slate-950">{produto ? "Produto não encontrado" : "Página não encontrada"}</h1>
        <p className="mt-4 leading-7 text-slate-600">{produto ? "O endereço pode estar incorreto ou este produto não está mais no catálogo." : "Este endereço não está disponível. Busque um produto ou explore nossas ofertas para continuar."}</p>
        <div className="mx-auto mt-6 max-w-md"><SearchBar /></div>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/ofertas" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Explorar ofertas</Link>
          <Link href="/" className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">Voltar ao início</Link>
        </div>
      </div>
    </main>
    <Footer />
  </>;
}
