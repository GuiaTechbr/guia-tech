"use client";

import { FormEvent, useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setCarregando(true);

    try {
      const resposta = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          senha,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(
          dados.erro || "Email ou senha inválidos."
        );
        return;
      }

      window.location.href = "/admin";
    } catch (error) {
      console.error(error);
      setErro("Não foi possível fazer login.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <div className="mb-4 text-4xl">🔐</div>

          <h1 className="text-3xl font-bold text-zinc-900">
            Guia Tech
          </h1>

          <p className="mt-2 text-zinc-500">
            Acesso administrativo
          </p>
        </div>

        {erro && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {erro}
          </div>
        )}

        <form
          onSubmit={entrar}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-700">
              Email
            </label>

            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              className="w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-black"
              placeholder="admin@guiatech.com.br"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-700">
              Senha
            </label>

            <input
              type="password"
              required
              autoComplete="current-password"
              value={senha}
              onChange={(event) =>
                setSenha(event.target.value)
              }
              className="w-full rounded-lg border border-zinc-300 px-4 py-3 outline-none focus:border-black"
              placeholder="Digite sua senha"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {carregando
              ? "Entrando..."
              : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}