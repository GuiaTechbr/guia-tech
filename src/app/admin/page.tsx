import { redirect } from "next/navigation";
import { getAdminLogado } from "@/lib/admin-auth";

export default async function AdminPage() {
  const admin = await getAdminLogado();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">
            Painel Administrativo
          </h1>

          <p className="mt-2 text-zinc-600">
            Gerencie os produtos e conteúdos do Guia Tech.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-4 text-3xl">📦</div>

            <h2 className="text-xl font-semibold text-zinc-900">
              Produtos
            </h2>

            <p className="mt-2 text-sm text-zinc-600">
              Cadastre, edite e gerencie os produtos do Guia Tech.
            </p>

            <div className="mt-5">
              <a
                href="/admin/produtos"
                className="inline-flex rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Gerenciar produtos
              </a>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-4 text-3xl">🔥</div>

            <h2 className="text-xl font-semibold text-zinc-900">
              Ofertas
            </h2>

            <p className="mt-2 text-sm text-zinc-600">
              Gerencie produtos em destaque e ofertas.
            </p>

            <div className="mt-5">
              <span className="inline-flex rounded-lg bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-500">
                Em breve
              </span>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-4 text-3xl">📊</div>

            <h2 className="text-xl font-semibold text-zinc-900">
              Estatísticas
            </h2>

            <p className="mt-2 text-sm text-zinc-600">
              Acompanhe acessos, produtos e desempenho.
            </p>

            <div className="mt-5">
              <span className="inline-flex rounded-lg bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-500">
                Em breve
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}