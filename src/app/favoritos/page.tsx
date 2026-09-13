import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FavoriteProducts from "@/components/FavoriteProducts";
import prisma from "@/lib/prisma";

export const metadata: Metadata = { title: "Meus favoritos", robots: { index: false, follow: true } };
export default async function FavoritosPage() {
  const produtos = await prisma.produto.findMany({
    orderBy: [{ criadoEm: "desc" }, { id: "desc" }],
    select: { id: true, nome: true, marca: true, categoria: true, preco: true, imagem: true },
  });
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Meus favoritos</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">Guarde suas opções para decidir depois. Os favoritos ficam neste navegador, sem cadastro, e podem ser apagados ao limpar os dados de navegação.</p>
          <div className="mt-8"><FavoriteProducts produtos={produtos} /></div>
        </div>
      </main>
      <Footer />
    </>
  );
}
