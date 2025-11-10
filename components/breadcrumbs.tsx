import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

export default function Breadcrumbs({ items = [] }: BreadcrumbsProps) {
  if (items.length === 0) {
    return (
      <nav className="text-sm text-gray-600 mb-4">
        <ol className="flex flex-wrap items-center space-x-2">
          <li>
            <Link href="/" className="hover:underline text-blue-600">
              Home
            </Link>
          </li>
        </ol>
      </nav>
    );
  }

  return (
    <nav className="text-sm text-gray-600 mb-4">
      <ol className="flex flex-wrap items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {item.href ? (
              <Link href={item.href} className="hover:underline text-blue-600">
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
            {index < items.length - 1 && <span className="mx-2">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
