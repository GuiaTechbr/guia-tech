import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import {
  COOKIE_NAME,
  verificarSessaoAdmin,
} from "@/lib/session";

export async function getAdminLogado() {
  const cookieStore = await cookies();

  const cookie = cookieStore.get(COOKIE_NAME);

  if (!cookie?.value) {
    return null;
  }

  if (!verificarSessaoAdmin(cookie.value)) {
    return null;
  }

  const partes = cookie.value.split(".");

  if (partes.length !== 2) {
    return null;
  }

  const adminId = Number(partes[0]);

  if (!Number.isInteger(adminId) || adminId <= 0) {
    return null;
  }

  const admin = await prisma.admin.findUnique({
    where: {
      id: adminId,
    },
    select: {
      id: true,
      email: true,
    },
  });

  return admin;
}