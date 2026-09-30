import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { COOKIE_NAME, lerSessaoAdmin } from "@/lib/session";

export async function getAdminLogado() {
  const cookieStore = await cookies();
  const sessao = lerSessaoAdmin(cookieStore.get(COOKIE_NAME)?.value);
  if (!sessao) return null;

  return prisma.admin.findUnique({
    where: { id: sessao.adminId },
    select: { id: true, email: true },
  });
}
