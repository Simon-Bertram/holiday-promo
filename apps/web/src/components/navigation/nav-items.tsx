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

type NavItemsProps = {
  className?: string;
  onItemClick?: () => void;
};

export default function NavItems({ className, onItemClick }: NavItemsProps) {
  const pathname = usePathname();

  const isCurrentPage = (href: string) => pathname === href;

  return (
    <div className={className}>
      {navItems.map((item: NavItem) => (
        <Link
          className={cn(
            `${montserrat.variable} font-black text-xl antialiased transition-colors hover:text-zinc-700 dark:hover:text-zinc-300`,
            isCurrentPage(item.href) && "text-black dark:text-zinc-300"
          )}
          href={item.href}
          key={item.href}
          onClick={onItemClick}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
