 import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const produtos = await prisma.produto.findMany({
      orderBy: {
        criadoEm: "desc",
      },
    });

    return Response.json(produtos);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);

    return Response.json(
      { erro: "Erro ao buscar produtos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const produto = await prisma.produto.create({
      data: {
        nome: body.nome,
        marca: body.marca,
        categoria: body.categoria,
        descricao: body.descricao || null,
        preco:
          body.preco !== undefined &&
          body.preco !== null &&
          body.preco !== ""
            ? Number(body.preco)
            : null,
        imagem: body.imagem || null,
        linkAfiliado: body.linkAfiliado || null,
      },
    });

    return Response.json(produto, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar produto:", error);

    return Response.json(
      { erro: "Erro ao criar produto" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return Response.json(
        { erro: "ID do produto é obrigatório" },
        { status: 400 }
      );
    }

    const produto = await prisma.produto.update({
      where: {
        id: Number(body.id),
      },
      data: {
        nome: body.nome,
        marca: body.marca,
        categoria: body.categoria,
        descricao: body.descricao || null,
        preco:
          body.preco !== undefined &&
          body.preco !== null &&
          body.preco !== ""
            ? Number(body.preco)
            : null,
        imagem: body.imagem || null,
        linkAfiliado: body.linkAfiliado || null,
      },
    });

    return Response.json(produto);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);

    return Response.json(
      { erro: "Erro ao atualizar produto" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return Response.json(
        { erro: "ID do produto é obrigatório" },
        { status: 400 }
      );
    }

    await prisma.produto.delete({
      where: {
        id: Number(body.id),
      },
    });

    return Response.json({
      mensagem: "Produto excluído com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir produto:", error);

    return Response.json(
      { erro: "Erro ao excluir produto" },
      { status: 500 }
    );
  }
}