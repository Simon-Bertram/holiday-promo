"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { authClient } from "@/lib/auth-client";
import { montserrat } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type NavItem = {
  href: "/" | "/dashboard" | "/profile" | "/todos";
  label: string;
};

type NavItemsProps = {
  className?: string;
  onItemClick?: () => void;
};

export default function NavItems({ className, onItemClick }: NavItemsProps) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  const navItems: NavItem[] = useMemo(() => {
    const base: NavItem[] = [
      { href: "/", label: "Home" },
      { href: "/todos", label: "Todos" },
    ];

    if (!session?.user) {
      return base;
    }

    const roleItem: NavItem =
      session.user.role === "admin"
        ? { href: "/dashboard", label: "Dashboard" }
        : { href: "/profile", label: "Profile" };

    return [base[0], roleItem, ...base.slice(1)];
  }, [session]);

  const isCurrentPage = (href: string) => pathname === href;

  return (
    <div className={className}>
      {navItems.map((item) => (
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
