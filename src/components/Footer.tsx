import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Guia Tech
            </h2>

            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
              Conteúdo, comparativos e ofertas selecionadas para ajudar você
              a fazer escolhas melhores em tecnologia.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">
              Navegação
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm">
              <Link href="/" className="transition hover:text-blue-400">
                Início
              </Link>

              <Link href="/ofertas" className="transition hover:text-blue-400">
                Ofertas
              </Link>

              <Link href="/#categorias" className="transition hover:text-blue-400">
                Categorias
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">
              Conteúdo
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm">
              <Link href="/favoritos" className="transition hover:text-blue-400">Meus favoritos</Link>

              <Link href="/comparar" className="transition hover:text-blue-400">Comparar produtos</Link>

              <span className="text-slate-400">
                Blog
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">
              Institucional
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm">
              <span className="text-slate-400">
                Sobre
              </span>

              <span className="text-slate-400">
                Política de Privacidade
              </span>

              <span className="text-slate-400">
                Termos de Uso
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6">
          <p className="text-xs leading-5 text-slate-400">
            O Guia Tech pode receber comissão por compras realizadas através
            de links de afiliados, sem custo adicional para você.
          </p>

          <p className="mt-3 text-xs text-slate-400">
            © 2026 Guia Tech. Todos os direitos reservados.
          </p>
        </div>

      </div>
    </footer>
  );
}