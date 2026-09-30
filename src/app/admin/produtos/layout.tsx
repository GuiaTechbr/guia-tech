import { redirect } from "next/navigation";
import { getAdminLogado } from "@/lib/admin-auth";
import { AVISO_BANCO_LOCAL, podeGravarBanco } from "@/lib/database-config";

export default async function ProdutosAdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await getAdminLogado())) redirect("/admin/login");

  return (
    <>
      {!podeGravarBanco() && (
        <aside role="status" className="border-b border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-950">
          {AVISO_BANCO_LOCAL}
        </aside>
      )}
      {children}
    </>
  );
}
