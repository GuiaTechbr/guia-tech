import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { AVISO_BANCO_LOCAL, podeGravarBanco } from "@/lib/database-config";
import { getAdminLogado } from "@/lib/admin-auth";
import { produtoInput, produtoEdicaoInput, produtoExclusaoInput } from "@/lib/admin-input";
import { ErroRequisicao, lerJson } from "@/lib/api-json";
import prisma from "@/lib/prisma";

function atualizarCatalogo() {
  revalidatePath("/");
  revalidatePath("/ofertas");
  revalidatePath("/busca");
  revalidatePath("/favoritos");
  revalidatePath("/comparar");
  revalidatePath("/categoria/[nome]", "page");
  revalidatePath("/produtos/[id]", "page");
  revalidatePath("/sitemap.xml");
}

async function verificarPermissao() {
  if (!(await getAdminLogado())) {
    return Response.json({ erro: "Sua sessão terminou ou você não está conectado. Faça login novamente para alterar produtos." }, { status: 401 });
  }
  if (!podeGravarBanco()) {
    return Response.json({ erro: AVISO_BANCO_LOCAL }, { status: 503 });
  }
  return null;
}

function responderErro(error: unknown, mensagem: string) {
  if (error instanceof ErroRequisicao) {
    return Response.json({ erro: error.message }, { status: error.status });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return Response.json({ erro: "Produto não encontrado. Atualize a lista e tente novamente." }, { status: 404 });
  }
  console.error(mensagem, error);
  return Response.json({ erro: mensagem }, { status: 500 });
}

export async function GET() {
  try {
    const produtos = await prisma.produto.findMany({ orderBy: { criadoEm: "desc" } });
    return Response.json(produtos);
  } catch (error) {
    return responderErro(error, "Erro ao buscar produtos");
  }
}

export async function POST(request: Request) {
  try {
    const impedimento = await verificarPermissao();
    if (impedimento) return impedimento;
    const entrada = produtoInput.safeParse(await lerJson(request));
    if (!entrada.success) {
      return Response.json({ erro: entrada.error.issues[0].message }, { status: 400 });
    }

    const produto = await prisma.produto.create({ data: entrada.data });
    atualizarCatalogo();
    return Response.json(produto, { status: 201 });
  } catch (error) {
    return responderErro(error, "Erro ao criar produto");
  }
}

export async function PUT(request: Request) {
  try {
    const impedimento = await verificarPermissao();
    if (impedimento) return impedimento;
    const entrada = produtoEdicaoInput.safeParse(await lerJson(request));
    if (!entrada.success) {
      return Response.json({ erro: entrada.error.issues[0].message }, { status: 400 });
    }

    const { id, ...data } = entrada.data;
    const produto = await prisma.produto.update({ where: { id }, data });
    atualizarCatalogo();
    return Response.json(produto);
  } catch (error) {
    return responderErro(error, "Erro ao atualizar produto");
  }
}

export async function DELETE(request: Request) {
  try {
    const impedimento = await verificarPermissao();
    if (impedimento) return impedimento;
    const entrada = produtoExclusaoInput.safeParse(await lerJson(request));
    if (!entrada.success) {
      return Response.json({ erro: entrada.error.issues[0].message }, { status: 400 });
    }

    await prisma.produto.delete({ where: { id: entrada.data.id } });
    atualizarCatalogo();
    return Response.json({ mensagem: "Produto excluído com sucesso" });
  } catch (error) {
    return responderErro(error, "Erro ao excluir produto");
  }
}
