"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <div className="flex space-x-12">
      {links.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className={clsx(
            "text-lg font-semibold text-white hover:text-blue-600 transition-colors duration-200",
            "border-b-2 border-transparent pb-1 cursor-pointer",
            {
              "border-blue-600 text-blue-600": pathname === link.href,
            }
          )}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
