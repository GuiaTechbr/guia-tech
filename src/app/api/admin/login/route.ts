import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verificarSenha } from "@/lib/auth";
import { loginInput } from "@/lib/admin-input";
import { ErroRequisicao, lerJson } from "@/lib/api-json";
import { COOKIE_NAME, criarSessaoAdmin, DURACAO_SESSAO_SEGUNDOS } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const entrada = loginInput.safeParse(await lerJson(request, 8 * 1024));
    if (!entrada.success) {
      return Response.json({ erro: entrada.error.issues[0].message }, { status: 400 });
    }
    const { email, senha } = entrada.data;
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin || !verificarSenha(senha, admin.senhaHash)) {
      return Response.json({ erro: "Email ou senha inválidos." }, { status: 401 });
    }

    const sessao = criarSessaoAdmin(admin.id);
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, sessao, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: DURACAO_SESSAO_SEGUNDOS,
    });

    return Response.json({ sucesso: true, admin: { id: admin.id, email: admin.email } });
  } catch (error) {
    if (error instanceof ErroRequisicao) {
      return Response.json({ erro: error.message }, { status: error.status });
    }
    console.error("Erro no login:", error);
    return Response.json({ erro: "Erro ao realizar login." }, { status: 500 });
  }
}
