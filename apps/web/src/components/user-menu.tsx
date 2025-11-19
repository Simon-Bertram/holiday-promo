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
type SessionUser = NonNullable<SessionData> extends { user: infer U }
  ? U
  : never;

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

  if (!session) {
    return (
      <Button asChild>
        <Link href="/login" onClick={closeMobileMenu}>
          Sign In
        </Link>
      </Button>
    );
  }

  const roleLink: {
    href: "/dashboard" | "/profile";
    label: "Dashboard" | "My Profile";
  } =
    hasRole(session.user) && session.user.role === "admin"
      ? { href: "/dashboard", label: "Dashboard" }
      : { href: "/profile", label: "My Profile" };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{session.user.name}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-card">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>{session.user.email}</DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={roleLink.href} onClick={closeMobileMenu}>
            {roleLink.label}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/todos" onClick={closeMobileMenu}>
            Todos
          </Link>
        </DropdownMenuItem>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
