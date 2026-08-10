export default function Header() {
  return (
    <header className="border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">

        <div>
          <h1 className="text-3xl font-bold text-zinc-900">
            🚀 Guia Tech
          </h1>

          <p className="text-sm text-zinc-500">
            Tecnologia, ofertas e análises
          </p>
        </div>


        <nav>
          <ul className="flex gap-6 text-sm font-medium text-zinc-700">

            <li>
              <a href="/" className="transition hover:text-black">
                Início
              </a>
            </li>

            <li>
              <a href="#" className="transition hover:text-black">
                Smartphones
              </a>
            </li>

            <li>
              <a href="#" className="transition hover:text-black">
                Notebooks
              </a>
            </li>

            <li>
              <a href="#" className="transition hover:text-black">
                Smart TVs
              </a>
            </li>

            <li>
              <a href="#" className="transition hover:text-black">
                Games
              </a>
            </li>

            <li>
              <a href="#" className="transition hover:text-black">
                Ofertas
              </a>
            </li>

          </ul>
        </nav>

      </div>
    </header>
  );
}