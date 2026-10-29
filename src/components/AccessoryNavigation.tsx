import Link from "next/link";
import { accessoryGroups, accessoryGroup, accessoryPath } from "@/lib/accessories";

export default function AccessoryNavigation({ produtos, selecionada }: {
  produtos: { nome: string; categoria: string; fichaTecnica?: string | null }[];
  selecionada: string;
}) {
  const counts = new Map<string, number>();
  for (const produto of produtos) {
    const group = accessoryGroup(produto);
    counts.set(group, (counts.get(group) ?? 0) + 1);
  }
  const links = [{ slug: "", nome: "Todos os acessórios", quantidade: produtos.length },
    ...accessoryGroups.map(group => ({ ...group, quantidade: counts.get(group.slug) ?? 0 }))
      .filter(group => group.quantidade > 0)];
  return <nav aria-label="Subcategorias de Acessórios" className="mb-8">
    <h2 className="text-2xl font-bold text-slate-900">Encontre por tipo de acessório</h2>
    <p className="mt-2 text-sm text-slate-600">Escolha um grupo e refine por marca ou preço.</p>
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {links.map(link => <Link key={link.slug} href={accessoryPath(link.slug) + "#catalogo-acessorios"}
        aria-current={selecionada === link.slug ? "page" : undefined}
        className={`rounded-xl border px-4 py-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${selecionada === link.slug ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50"}`}>
        {link.nome}<span className="mt-1 block text-xs font-normal">{link.quantidade} produto(s)</span>
      </Link>)}
    </div>
  </nav>;
}
