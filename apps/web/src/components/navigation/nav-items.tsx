"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { authClient } from "@/lib/auth-client";
import { montserrat } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type NavItem = {
  href: "/" | "/dashboard" | "/profile";
  label: string;
};

type NavItemsProps = {
  className?: string;
  onItemClick?: () => void;
};

type SessionData = ReturnType<typeof authClient.useSession>["data"];
type SessionUser = NonNullable<SessionData> extends { user: infer U }
  ? U
  : never;

const hasRole = (
  user: SessionUser | undefined
): user is SessionUser & { role: "admin" | "user" } =>
  Boolean(user && typeof (user as { role?: unknown }).role === "string");

export default function NavItems({ className, onItemClick }: NavItemsProps) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  const navItems: NavItem[] = useMemo(() => {
    const base: NavItem[] = [{ href: "/", label: "Home" }];

    if (!session?.user) {
      return base;
    }

    const roleItem: NavItem =
      hasRole(session.user) && session.user.role === "admin"
        ? { href: "/dashboard", label: "Dashboard" }
        : { href: "/profile", label: "Profile" };

    return [...base, roleItem];
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
