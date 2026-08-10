import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b bg-white shadow-sm">

      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">


        <Link href="/" className="group">

          <h1 className="text-3xl font-bold text-zinc-900 transition group-hover:text-black">
            🚀 Guia Tech
          </h1>

          <p className="text-sm text-zinc-500">
            Tecnologia, ofertas e análises
          </p>

        </Link>



        <nav>

          <ul className="flex items-center gap-6 text-sm font-medium text-zinc-700">


            <li>
              <Link
                href="/"
                className="transition hover:text-black"
              >
                Início
              </Link>
            </li>


            <li>
              <Link
                href="/categoria/Smartphone"
                className="transition hover:text-black"
              >
                Smartphones
              </Link>
            </li>


            <li>
              <Link
                href="/categoria/Notebook"
                className="transition hover:text-black"
              >
                Notebooks
              </Link>
            </li>


            <li>
              <Link
                href="/categoria/Smart%20TV"
                className="transition hover:text-black"
              >
                Smart TVs
              </Link>
            </li>


            <li>
              <Link
                href="/categoria/Games"
                className="transition hover:text-black"
              >
                Games
              </Link>
            </li>


            <li>

              <Link
                href="#ofertas"
                className="rounded-lg bg-black px-4 py-2 text-white transition hover:bg-zinc-800"
              >
                🔥 Ofertas
              </Link>

            </li>


          </ul>

        </nav>


      </div>

    </header>
  );
}