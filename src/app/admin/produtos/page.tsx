"use client";

import { FormEvent, useEffect, useState } from "react";

type Produto = {
  id: number;
  nome: string;
  marca: string;
  categoria: string;
  descricao: string | null;
  preco: number | null;
  imagem: string | null;
  linkAfiliado: string | null;
};

type Formulario = {
  nome: string;
  marca: string;
  categoria: string;
  descricao: string;
  preco: string;
  imagem: string;
  linkAfiliado: string;
};

const formularioInicial: Formulario = {
  nome: "",
  marca: "",
  categoria: "",
  descricao: "",
  preco: "",
  imagem: "",
  linkAfiliado: "",
};

export default function AdminProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [formulario, setFormulario] =
    useState<Formulario>(formularioInicial);

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  async function carregarProdutos() {
    try {
      setCarregando(true);

      const resposta = await fetch("/api/produtos");

      if (!resposta.ok) {
        throw new Error("Erro ao carregar produtos");
      }

      const dados = await resposta.json();

      setProdutos(dados);
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao carregar produtos.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  function alterarCampo(
    campo: keyof Formulario,
    valor: string
  ) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  function editarProduto(produto: Produto) {
    setEditandoId(produto.id);

    setFormulario({
      nome: produto.nome,
      marca: produto.marca,
      categoria: produto.categoria,
      descricao: produto.descricao || "",
      preco:
        produto.preco !== null
          ? String(produto.preco)
          : "",
      imagem: produto.imagem || "",
      linkAfiliado: produto.linkAfiliado || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setFormulario(formularioInicial);
    setMensagem("");
  }

  async function salvarProduto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSalvando(true);
    setMensagem("");

    try {
      const resposta = await fetch("/api/produtos", {
        method: editandoId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editandoId,
          ...formulario,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro || "Erro ao salvar produto"
        );
      }

      setMensagem(
        editandoId
          ? "Produto atualizado com sucesso!"
          : "Produto cadastrado com sucesso!"
      );

      setEditandoId(null);
      setFormulario(formularioInicial);

      await carregarProdutos();
    } catch (error) {
      console.error(error);

      setMensagem(
        error instanceof Error
          ? error.message
          : "Erro ao salvar produto."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirProduto(id: number) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este produto?"
    );

    if (!confirmar) {
      return;
    }

    try {
      const resposta = await fetch("/api/produtos", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro || "Erro ao excluir produto"
        );
      }

      setMensagem("Produto excluído com sucesso!");

      if (editandoId === id) {
        cancelarEdicao();
      }

      await carregarProdutos();
    } catch (error) {
      console.error(error);

      setMensagem(
        error instanceof Error
          ? error.message
          : "Erro ao excluir produto."
      );
    }
  }

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <a
            href="/admin"
            className="text-sm font-medium text-zinc-600 hover:text-black"
          >
            ← Voltar para o painel
          </a>

          <h1 className="mt-4 text-3xl font-bold text-zinc-900">
            Gerenciar Produtos
          </h1>

          <p className="mt-2 text-zinc-600">
            Cadastre, edite e exclua os produtos do Guia Tech.
          </p>
        </div>

        {mensagem && (
          <div className="mb-6 rounded-xl border bg-white p-4 text-sm font-medium text-zinc-700 shadow-sm">
            {mensagem}
          </div>
        )}

        <section className="mb-10 rounded-2xl bg-white p-6 shadow-md">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-900">
                {editandoId
                  ? "Editar produto"
                  : "Novo produto"}
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Preencha as informações abaixo.
              </p>
            </div>

            {editandoId && (
              <button
                type="button"
                onClick={cancelarEdicao}
                className="rounded-lg bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-300"
              >
                Cancelar
              </button>
            )}
          </div>

          <form
            onSubmit={salvarProduto}
            className="grid gap-5 md:grid-cols-2"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700">
                Nome
              </label>

              <input
                required
                value={formulario.nome}
                onChange={(event) =>
                  alterarCampo("nome", event.target.value)
                }
                className="w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-black"
                placeholder="Samsung Galaxy S25 Ultra"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700">
                Marca
              </label>

              <input
                required
                value={formulario.marca}
                onChange={(event) =>
                  alterarCampo("marca", event.target.value)
                }
                className="w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-black"
                placeholder="Samsung"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700">
                Categoria
              </label>

              <input
                required
                value={formulario.categoria}
                onChange={(event) =>
                  alterarCampo(
                    "categoria",
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-black"
                placeholder="Smartphone"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700">
                Preço
              </label>

              <input
                type="number"
                step="0.01"
                value={formulario.preco}
                onChange={(event) =>
                  alterarCampo("preco", event.target.value)
                }
                className="w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-black"
                placeholder="6999.90"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-zinc-700">
                Descrição
              </label>

              <textarea
                value={formulario.descricao}
                onChange={(event) =>
                  alterarCampo(
                    "descricao",
                    event.target.value
                  )
                }
                rows={4}
                className="w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-black"
                placeholder="Descrição do produto..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700">
                URL da imagem
              </label>

              <input
                type="text"
                value={formulario.imagem}
                onChange={(event) =>
                  alterarCampo("imagem", event.target.value)
                }
                className="w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-black"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700">
                Link de afiliado
              </label>

              <input
                type="text"
                value={formulario.linkAfiliado}
                onChange={(event) =>
                  alterarCampo(
                    "linkAfiliado",
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-black"
                placeholder="https://www.amazon.com.br/..."
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={salvando}
                className="w-full rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {salvando
                  ? "Salvando..."
                  : editandoId
                    ? "Salvar alterações"
                    : "Cadastrar produto"}
              </button>
            </div>
          </form>
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-zinc-900">
              Produtos cadastrados
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              {produtos.length} produto(s) encontrado(s).
            </p>
          </div>

          {carregando ? (
            <div className="rounded-xl bg-white p-8 text-center shadow-sm">
              Carregando produtos...
            </div>
          ) : produtos.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center shadow-sm">
              <p className="font-medium text-zinc-700">
                Nenhum produto cadastrado.
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Use o formulário acima para cadastrar o
                primeiro produto.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {produtos.map((produto) => (
                <article
                  key={produto.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-md"
                >
                  <div className="flex h-48 items-center justify-center bg-zinc-100 p-4">
                    {produto.imagem ? (
                      <img
                        src={produto.imagem}
                        alt={produto.nome}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-sm text-zinc-400">
                        Sem imagem
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <span className="rounded-full bg-black px-3 py-1 text-xs text-white">
                      {produto.categoria}
                    </span>

                    <h3 className="mt-4 text-lg font-bold text-zinc-900">
                      {produto.nome}
                    </h3>

                    <p className="mt-1 text-sm text-zinc-500">
                      {produto.marca}
                    </p>

                    <p className="mt-3 text-xl font-bold text-green-600">
                      {produto.preco !== null
                        ? `R$ ${produto.preco.toLocaleString(
                            "pt-BR",
                            {
                              minimumFractionDigits: 2,
                            }
                          )}`
                        : "Preço não informado"}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          editarProduto(produto)
                        }
                        className="rounded-lg bg-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-300"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          excluirProduto(produto.id)
                        }
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}