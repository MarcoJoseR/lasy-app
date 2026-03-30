import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-zinc-900 text-white px-6 py-4 flex justify-between items-center shadow-md">

      {/* LOGO */}
      <Link href="/">
        <h1 className="text-xl font-bold cursor-pointer">
          🍳 Lasy Receitas
        </h1>
      </Link>

      {/* MENU */}
      <div className="flex gap-4">

        <Link href="/">
          <button className="bg-zinc-800 px-3 py-2 rounded hover:bg-zinc-700">
            Home
          </button>
        </Link>

        <Link href="/favoritos">
          <button className="bg-yellow-500 text-black px-3 py-2 rounded hover:bg-yellow-400">
            ⭐ Favoritos
          </button>
        </Link>

      </div>
    </nav>
  );
}