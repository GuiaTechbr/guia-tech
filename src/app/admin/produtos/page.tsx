"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type Produto = {
  id: number;
  nome: string;
  marca: string;
  categoria: string;
  descricao: string | null;
  preco: number | null;
  imagem: string | null;
  linkAfiliado: string | null;
  destaques: string | null;
  fichaTecnica: string | null;
  pontosPositivos: string | null;
  pontosAtencao: string | null;
};

type Formulario = {
  nome: string;
  marca: string;
  categoria: string;
  descricao: string;
  preco: string;
  imagem: string;
  linkAfiliado: string;
  destaques: string;
  fichaTecnica: string;
  pontosPositivos: string;
  pontosAtencao: string;
};

const formularioInicial: Formulario = {
  nome: "",
  marca: "",
  categoria: "",
  descricao: "",
  preco: "",
  imagem: "",
  linkAfiliado: "",
  destaques: "",
  fichaTecnica: "",
  pontosPositivos: "",
  pontosAtencao: "",
};

const categoriasPadrao = ["Smartphone", "Notebook", "Smart TV", "Games", "Casa Inteligente"];

function normalizarBusca(texto: string) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
}

function ImagemProduto({ src, nome }: { src: string; nome: string }) {
  const [estado, setEstado] = useState<"carregando" | "pronta" | "erro">("carregando");

  if (!src || estado === "erro") {
    return (
      <p className="px-5 text-center text-sm leading-6 text-slate-500" role="status">
        {src ? "Não foi possível carregar a imagem. Confira o endereço informado." : "Informe a URL da imagem para visualizar o produto."}
      </p>
    );
  }

  return (
    <>
      {estado === "carregando" && <span className="absolute text-sm text-slate-500" role="status">Carregando imagem...</span>}
      {/* URLs do cadastro são exibidas diretamente, sem exigir configuração de domínios. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={nome || "Pré-visualização do produto"} onLoad={() => setEstado("pronta")} onError={() => setEstado("erro")} className={`h-full w-full object-contain ${estado === "pronta" ? "opacity-100" : "opacity-0"}`} />
    </>
  );
}

export default function AdminProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [formulario, setFormulario] =
    useState<Formulario>(formularioInicial);

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const termoBusca = normalizarBusca(busca);
  const filtrosAtivos = busca !== "" || categoriaFiltro !== "";
  const categoriasFiltro = Array.from(new Set([
    ...categoriasPadrao,
    ...produtos.map((produto) => produto.categoria).filter(Boolean),
    ...(categoriaFiltro ? [categoriaFiltro] : []),
  ])).sort((a, b) => a.localeCompare(b, "pt-BR"));
  const produtosFiltrados = produtos.filter((produto) =>
    normalizarBusca(produto.nome).includes(termoBusca) &&
    (!categoriaFiltro || produto.categoria === categoriaFiltro)
  );

  function limparFiltros() {
    setBusca("");
    setCategoriaFiltro("");
  }

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
    // Mantém o carregamento compartilhado pelo CRUD; o estado inicial já é true.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      destaques: produto.destaques || "",
      fichaTecnica: produto.fichaTecnica || "",
      pontosPositivos: produto.pontosPositivos || "",
      pontosAtencao: produto.pontosAtencao || "",
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
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-sm font-medium text-slate-600 hover:text-blue-700"
          >
            ← Voltar para o painel
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            Gerenciar Produtos
          </h1>

          <p className="mt-2 text-slate-600">
            Cadastre, edite e exclua os produtos do Guia Tech.
          </p>
        </div>

        <nav aria-label="Navegação do cadastro" className="sticky top-3 z-10 mb-6 flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          <a href="#produtos-cadastrados" className="shrink-0 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            Buscar produtos
          </a>
          {[
            { id: "secao-01", nome: "Identificação" },
            { id: "secao-02", nome: "Conteúdo" },
            { id: "secao-03", nome: "Imagem" },
            { id: "secao-04", nome: "Oferta / Amazon" },
            { id: "acoes-produto", nome: "Revisar e salvar" },
          ].map((secao) => (
            <a key={secao.id} href={`#${secao.id}`} className="shrink-0 rounded-lg px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
              {secao.nome}
            </a>
          ))}
        </nav>

        {mensagem && (
          <div role="status" aria-live="polite" className="mb-6 rounded-xl border border-blue-200 bg-white p-4 text-sm font-medium text-slate-700 shadow-sm">
            {mensagem}
          </div>
        )}

        <section className="mb-10 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-blue-100 bg-blue-50 p-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">{editandoId !== null ? `Modo de edição · Produto #${editandoId}` : "Cadastro de produto"}</span>
              <h2 className="mt-2 text-xl font-bold text-slate-900">
                {editandoId
                  ? "Editar produto"
                  : "Novo produto"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {editandoId !== null ? `Editando: ${produtos.find((produto) => produto.id === editandoId)?.nome || formulario.nome}` : "Preencha as seções para publicar um novo produto no Guia Tech."}
              </p>
            </div>

            {editandoId && (
              <button
                type="button"
                onClick={cancelarEdicao}
                disabled={salvando}
                className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300"
              >
                Cancelar edição
              </button>
            )}
          </div>

<form onSubmit={salvarProduto} aria-busy={salvando}>
  <fieldset disabled={salvando} className="min-w-0 space-y-5 disabled:opacity-70">
    <legend className="sr-only">Informações do produto</legend>
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6" aria-labelledby="secao-01">
    <div className="mb-5 flex items-start gap-3">
      <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700">01</span>
      <div><h3 id="secao-01" className="scroll-mt-28 font-bold text-slate-900">Identificação</h3><p className="mt-1 text-sm leading-6 text-slate-500">Campos com * são obrigatórios.</p></div>
    </div>
    <div className="grid gap-5 md:grid-cols-2">            <div>
              <label htmlFor="nome" className="mb-2 block text-sm font-semibold text-slate-700">
                Nome *
              </label>

              <input
                id="nome"
                name="nome"
                required
                value={formulario.nome}
                onChange={(event) =>
                  alterarCampo("nome", event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Samsung Galaxy S25 Ultra"
              />
            </div>            <div>
              <label htmlFor="marca" className="mb-2 block text-sm font-semibold text-slate-700">
                Marca *
              </label>

              <input
                id="marca"
                name="marca"
                required
                value={formulario.marca}
                onChange={(event) =>
                  alterarCampo("marca", event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Samsung"
              />
            </div>            <div>
              <label htmlFor="categoria" className="mb-2 block text-sm font-semibold text-slate-700">Categoria *</label>
              <select id="categoria" name="categoria" required value={formulario.categoria} onChange={(event) => alterarCampo("categoria", event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                <option value="" disabled>Selecione uma categoria</option>
                {formulario.categoria && !categoriasPadrao.includes(formulario.categoria) && (
                  <option value={formulario.categoria}>{formulario.categoria} (categoria atual)</option>
                )}
                {categoriasPadrao.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}
              </select>
              <p className="mt-2 text-xs text-slate-500">As mesmas categorias exibidas no site.</p>
            </div></div>
  </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6" aria-labelledby="secao-02">
    <div className="mb-5 flex items-start gap-3">
      <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700">02</span>
      <div><h3 id="secao-02" className="scroll-mt-28 font-bold text-slate-900">Conteúdo do produto</h3><p className="mt-1 text-sm leading-6 text-slate-500">Organize a descrição e os detalhes que ajudam o leitor a escolher.</p></div>
    </div>
    <div className="grid gap-5 md:grid-cols-2">            <div className="md:col-span-2">
              <label htmlFor="descricao" className="mb-2 block text-sm font-semibold text-slate-700">
                Descrição
              </label>

              <textarea
                id="descricao"
                name="descricao"
                value={formulario.descricao}
                onChange={(event) =>
                  alterarCampo("descricao", event.target.value)
                }
                rows={5}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Descrição geral do produto..."
              />
            </div>            <div className="md:col-span-2">
              <label htmlFor="destaques" className="mb-2 block text-sm font-semibold text-slate-700">
                Destaques
              </label>

              <textarea
                aria-describedby="destaques-ajuda"
                id="destaques"
                name="destaques"
                value={formulario.destaques}
                onChange={(event) =>
                  alterarCampo("destaques", event.target.value)
                }
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder={"Exemplo:\nTela de alta qualidade\nCâmeras avançadas\nExcelente desempenho"}
              />
              <p id="destaques-ajuda" className="mt-2 text-xs text-slate-500">Escreva um item por linha.</p>
            </div>            <div className="md:col-span-2">
              <label htmlFor="fichaTecnica" className="mb-2 block text-sm font-semibold text-slate-700">
                Ficha técnica
              </label>

              <textarea
                aria-describedby="fichaTecnica-ajuda"
                id="fichaTecnica"
                name="fichaTecnica"
                value={formulario.fichaTecnica}
                onChange={(event) =>
                  alterarCampo("fichaTecnica", event.target.value)
                }
                rows={6}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder={"Exemplo:\nProcessador: ...\nMemória RAM: ...\nArmazenamento: ...\nTela: ..."}
              />
              <p id="fichaTecnica-ajuda" className="mt-2 text-xs text-slate-500">Uma especificação por linha, no formato: Tela: 6,7 polegadas.</p>
            </div>            <div>
              <label htmlFor="pontosPositivos" className="mb-2 block text-sm font-semibold text-slate-700">
                Pontos positivos
              </label>

              <textarea
                aria-describedby="pontosPositivos-ajuda"
                id="pontosPositivos"
                name="pontosPositivos"
                value={formulario.pontosPositivos}
                onChange={(event) =>
                  alterarCampo("pontosPositivos", event.target.value)
                }
                rows={6}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder={"Exemplo:\nÓtimo desempenho\nBoa construção\nCâmeras versáteis"}
              />
              <p id="pontosPositivos-ajuda" className="mt-2 text-xs text-slate-500">Escreva um item por linha.</p>
            </div>            <div>
              <label htmlFor="pontosAtencao" className="mb-2 block text-sm font-semibold text-slate-700">
                Pontos de atenção
              </label>

              <textarea
                aria-describedby="pontosAtencao-ajuda"
                id="pontosAtencao"
                name="pontosAtencao"
                value={formulario.pontosAtencao}
                onChange={(event) =>
                  alterarCampo("pontosAtencao", event.target.value)
                }
                rows={6}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder={"Exemplo:\nPreço elevado\nAcessórios vendidos separadamente"}
              />
              <p id="pontosAtencao-ajuda" className="mt-2 text-xs text-slate-500">Escreva um item por linha.</p>
            </div></div>
  </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6" aria-labelledby="secao-03">
    <div className="mb-5 flex items-start gap-3">
      <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700">03</span>
      <div><h3 id="secao-03" className="scroll-mt-28 font-bold text-slate-900">Imagem do produto</h3><p className="mt-1 text-sm leading-6 text-slate-500">Confira a imagem antes de salvar o cadastro.</p></div>
    </div>
    <div className="grid gap-5 md:grid-cols-2">            <div>
              <label htmlFor="imagem" className="mb-2 block text-sm font-semibold text-slate-700">
                URL da imagem
              </label>

              <input
                id="imagem"
                name="imagem"
                type="text"
                value={formulario.imagem}
                onChange={(event) =>
                  alterarCampo("imagem", event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="https://..."
              />
            </div><div><span className="mb-2 block text-sm font-semibold text-slate-700">Pré-visualização</span><div className="relative flex h-56 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4"><ImagemProduto key={formulario.imagem.trim()} src={formulario.imagem.trim()} nome={formulario.nome} /></div></div></div>
  </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6" aria-labelledby="secao-04">
    <div className="mb-5 flex items-start gap-3">
      <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700">04</span>
      <div><h3 id="secao-04" className="scroll-mt-28 font-bold text-slate-900">Oferta / Amazon</h3><p className="mt-1 text-sm leading-6 text-slate-500">Informe o preço e o link de compra. Estes campos são opcionais.</p></div>
    </div>
    <div className="grid gap-5 md:grid-cols-2">            <div>
              <label htmlFor="preco" className="mb-2 block text-sm font-semibold text-slate-700">
                Preço (R$)
              </label>

              <input
                id="preco"
                name="preco"
                type="number"
                step="0.01"
                value={formulario.preco}
                onChange={(event) =>
                  alterarCampo("preco", event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="6999.90"
              />
            </div>            <div>
              <label htmlFor="linkAfiliado" className="mb-2 block text-sm font-semibold text-slate-700">
                Link de afiliado / Amazon
              </label>

              <input
                id="linkAfiliado"
                name="linkAfiliado"
                type="text"
                value={formulario.linkAfiliado}
                onChange={(event) =>
                  alterarCampo("linkAfiliado", event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="https://www.amazon.com.br/..."
              />
            </div></div>
  </section>
    <div id="acoes-produto" className="scroll-mt-28 flex flex-col gap-4 rounded-xl border border-blue-100 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600">{editandoId !== null ? "Revise as informações antes de salvar as alterações." : "Tudo pronto? Salve para adicionar o produto ao catálogo."}</p>
      <button type="submit" disabled={salvando} className="shrink-0 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50">
        {salvando ? "Salvando..." : editandoId !== null ? "Salvar alterações" : "Cadastrar produto"}
      </button>
    </div>
  </fieldset>
</form>
        </section>

        <section>
          <div className="mb-5">
            <h2 id="produtos-cadastrados" className="scroll-mt-28 text-2xl font-bold text-slate-900">
              Produtos cadastrados
            </h2>

            <p role="status" aria-live="polite" className="mt-1 text-sm text-slate-500">
              {carregando ? "Carregando catálogo..." : `Exibindo ${produtosFiltrados.length} de ${produtos.length} produto(s).`}
            </p>
          </div>

          <div role="search" aria-label="Filtrar produtos cadastrados" className="mb-5 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
            <div>
              <label htmlFor="busca-produtos" className="mb-2 block text-sm font-semibold text-slate-700">Buscar por nome</label>
              <input
                id="busca-produtos"
                type="search"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Ex.: iPhone, Galaxy, Lenovo..."
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label htmlFor="filtro-categoria" className="mb-2 block text-sm font-semibold text-slate-700">Filtrar por categoria</label>
              <select
                id="filtro-categoria"
                value={categoriaFiltro}
                onChange={(event) => setCategoriaFiltro(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Todas as categorias</option>
                {categoriasFiltro.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}
              </select>
            </div>
            <button type="button" onClick={limparFiltros} disabled={!filtrosAtivos} className="rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50">
              Limpar filtros
            </button>
          </div>

          {carregando ? (
            <div className="rounded-xl bg-white p-8 text-center shadow-sm">
              Carregando produtos...
            </div>
          ) : produtos.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center shadow-sm">
              <p className="font-medium text-slate-700">
                Nenhum produto cadastrado.
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Use o formulário acima para cadastrar o primeiro produto.
              </p>
            </div>
          ) : produtosFiltrados.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="font-semibold text-slate-700">Nenhum produto encontrado com esses filtros.</p>
              <p className="mt-2 text-sm text-slate-500">Tente outro nome ou selecione outra categoria.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {produtosFiltrados.map((produto) => (
                <article
                  key={produto.id}
                  className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${editandoId === produto.id ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"}`}
                >
                  <div className="relative flex h-48 items-center justify-center bg-slate-100 p-4">
                    {produto.imagem ? (
                      <ImagemProduto key={produto.imagem} src={produto.imagem} nome={produto.nome} />
                    ) : (
                      <span className="text-sm text-slate-400">
                        Sem imagem
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <span className="rounded-full bg-blue-600 px-3 py-1 text-xs text-white">
                      {produto.categoria}
                    </span>

                    <h3 className="mt-4 text-lg font-bold text-slate-900">
                      {produto.nome}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
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

                    <Link
                      href={`/produtos/${produto.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Ver no site: ${produto.nome} (abre em nova aba)`}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Ver no site <span aria-hidden="true">↗</span>
                    </Link>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        disabled={salvando}
                        onClick={() =>
                          editarProduto(produto)
                        }
                        className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-300"
                      >
                        {editandoId === produto.id ? "Em edição" : "Editar"}
                      </button>

                      <button
                        type="button"
                        disabled={salvando}
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