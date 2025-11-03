import Link from "next/link";
import { usePathname } from "next/navigation";
import { montserrat } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type NavItem = {
  href: "/" | "/dashboard" | "/todos";
  label: string;
};

export const navItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/todos", label: "Todos" },
];

export default function NavItems() {
  const pathname = usePathname();

  const isCurrentPage = (href: string) => pathname === href;

  return (
    <>
      {navItems.map(({ href, label }) => (
        <Link
          className={cn(
            `${montserrat.variable} font-black text-xl antialiased transition-colors hover:text-zinc-200 dark:hover:text-zinc-300`,
            isCurrentPage(href) && "text-zinc-200 dark:text-zinc-300"
          )}
          href={href}
          key={href}
        >
          {label}
        </Link>
      ))}
    </>
  );
}
