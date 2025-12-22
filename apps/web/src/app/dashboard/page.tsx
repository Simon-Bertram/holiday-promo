import { auth } from "@holiday-promo/auth";
import type { user as userTable } from "@holiday-promo/db/schema/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Dashboard from "./dashboard";

type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
type NonNullAuthSession = Exclude<AuthSession, null>;
type SessionWithRole = NonNullAuthSession & {
  user: NonNullAuthSession["user"] & {
    role: (typeof userTable.$inferSelect)["role"];
  };
};

export default async function DashboardPage() {
  const session = (await auth.api.getSession({
    headers: await headers(),
  })) as SessionWithRole | null;

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/profile");
  }

  return (
    <section className="mx-auto mt-24 flex w-full max-w-5xl flex-col gap-6 px-4 py-16">
      <header className="space-y-2">
        <h1 className="font-bold text-3xl">Dashboard</h1>
        <p className="text-muted-foreground">Welcome, {session.user.name}</p>
      </header>
      <Dashboard session={session} />
    </section>
  );
}
