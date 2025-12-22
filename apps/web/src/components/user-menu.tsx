"use client";

import { User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNavigation } from "@/app/hooks/use-navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

type SessionData = ReturnType<typeof authClient.useSession>["data"];
type SessionUser =
  NonNullable<SessionData> extends { user: infer U } ? U : never;

const hasRole = (
  user: SessionUser | undefined
): user is SessionUser & { role: "admin" | "user" } =>
  Boolean(user && typeof (user as { role?: unknown }).role === "string");

export default function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { closeMobileMenu } = useNavigation();

  if (isPending) {
    return <Skeleton className="h-9 w-24" />;
  }

  const roleLink: {
    href: "/dashboard" | "/profile";
    label: "Dashboard" | "My Profile";
  } | null = (() => {
    if (!session?.user) {
      return null;
    }
    if (hasRole(session.user) && session.user.role === "admin") {
      return { href: "/dashboard", label: "Dashboard" };
    }
    return { href: "/profile", label: "My Profile" };
  })();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          {session?.user ? (
            session.user.name
          ) : (
            <>
              <User className="size-4" />
              <span className="sr-only">User menu</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-card">
        {session?.user ? (
          <>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>{session.user.email}</DropdownMenuItem>
            {roleLink ? (
              <DropdownMenuItem asChild>
                <Link href={roleLink.href} onClick={closeMobileMenu}>
                  {roleLink.label}
                </Link>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Button
                className="w-full"
                onClick={() => {
                  authClient.signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        closeMobileMenu();
                        router.push("/");
                      },
                    },
                  });
                }}
                variant="destructive"
              >
                Sign Out
              </Button>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem asChild>
            <Link href="/login" onClick={closeMobileMenu}>
              Sign In
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
