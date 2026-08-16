import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verificarSenha } from "@/lib/auth";
import {
  COOKIE_NAME,
  criarSessaoAdmin,
} from "@/lib/session";
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const senha =
      typeof body.senha === "string"
        ? body.senha
        : "";

    if (!email || !senha) {
      return Response.json(
        { erro: "Email e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: {
        email,
      },
    });

    if (!admin) {
      return Response.json(
        { erro: "Email ou senha inválidos." },
        { status: 401 }
      );
    }

    const senhaValida = verificarSenha(
      senha,
      admin.senhaHash
    );

    if (!senhaValida) {
      return Response.json(
        { erro: "Email ou senha inválidos." },
        { status: 401 }
      );
    }

    const sessao = criarSessaoAdmin(admin.id);

    const cookieStore = await cookies();

    cookieStore.set(
      COOKIE_NAME,
      sessao,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      }
    );

    return Response.json({
      sucesso: true,
      admin: {
        id: admin.id,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);

    return Response.json(
      { erro: "Erro ao realizar login." },
      { status: 500 }
    );
  }
}