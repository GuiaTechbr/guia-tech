export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-5">

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
              <a href="/" className="hover:text-black">
                Início
              </a>
            </li>

            <li>
              <a href="#" className="hover:text-black">
                Smartphones
              </a>
            </li>

            <li>
              <a href="#" className="hover:text-black">
                Notebooks
              </a>
            </li>

            <li>
              <a href="#" className="hover:text-black">
                TVs
              </a>
            </li>

            <li>
              <a href="#" className="hover:text-black">
                Games
              </a>
            </li>

          </ul>
        </nav>

      </div>
    </header>
  );
}