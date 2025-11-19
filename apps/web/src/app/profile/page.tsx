import { auth } from "@holiday-promo/auth";
import type { user as userTable } from "@holiday-promo/db/schema/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DeleteAccountButton } from "@/components/delete-account-button";

type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
type NonNullAuthSession = Exclude<AuthSession, null>;

// Runtime type guard to verify role exists and is valid
function hasRole(
  user: NonNullAuthSession["user"]
): user is NonNullAuthSession["user"] & {
  role: (typeof userTable.$inferSelect)["role"];
} {
  return (
    "role" in user &&
    typeof user.role === "string" &&
    (user.role === "subscriber" || user.role === "admin")
  );
}

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Runtime validation: ensure role exists and is valid
  if (!hasRole(session.user)) {
    console.error("Session user missing valid role field");
    redirect("/login");
  }

  // TypeScript now knows session.user has role, but we've also verified it at runtime
  const userWithRole = session.user;

  if (userWithRole.role === "admin") {
    redirect("/dashboard");
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-16">
      <header className="space-y-2">
        <h1 className="font-bold text-3xl">Profile</h1>
        <p className="text-muted-foreground">
          Review your account details and keep them up to date.
        </p>
      </header>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <dl className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <dt className="font-medium text-muted-foreground text-sm">Name</dt>
            <dd className="mt-1 font-semibold text-base">
              {userWithRole.name}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground text-sm">Email</dt>
            <dd className="mt-1 font-semibold text-base">
              {userWithRole.email}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground text-sm">Role</dt>
            <dd className="mt-1 font-semibold text-base capitalize">
              {userWithRole.role}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground text-sm">
              Member since
            </dt>
            <dd className="mt-1 font-semibold text-base">
              {userWithRole.createdAt
                ? new Date(userWithRole.createdAt).toLocaleDateString()
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground text-sm">
              Danger Zone
            </dt>
            <dd className="mt-1 font-semibold text-base capitalize">
              <DeleteAccountButton />
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
