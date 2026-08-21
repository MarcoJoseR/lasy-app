import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";

interface BotaoLinkProps {
  href: string;
  children: ReactNode;
  title?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export default function BotaoLink({
  href,
  children,
  title,
  onClick,
}: BotaoLinkProps) {
  return (
    <Link
      href={href}
      title={title}
      onClick={onClick}
      className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
    >
      {children}
    </Link>
  );
}