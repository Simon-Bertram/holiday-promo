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
    <div>
      <h1>Dashboard</h1>
      <p>Welcome {session.user.name}</p>
      <Dashboard session={session} />
    </div>
  );
}
