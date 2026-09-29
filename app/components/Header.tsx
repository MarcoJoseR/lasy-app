import Link from "next/link";

export default function Header() {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">
        🍳 Health
      </h1>

      <div className="mt-3">
        <Link
          href="/bookdigital"
          className="inline-flex rounded-lg border border-purple-700 px-4 py-2 text-sm font-semibold text-purple-300 hover:bg-purple-950"
        >
          🧰 BaúDigital
        </Link>
      </div>
    </div>
  );
}