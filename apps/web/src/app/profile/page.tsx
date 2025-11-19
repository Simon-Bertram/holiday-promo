import { auth } from "@holiday-promo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "admin") {
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
              {session.user.name}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground text-sm">Email</dt>
            <dd className="mt-1 font-semibold text-base">
              {session.user.email}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground text-sm">Role</dt>
            <dd className="mt-1 font-semibold text-base capitalize">
              {session.user.role}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground text-sm">
              Member since
            </dt>
            <dd className="mt-1 font-semibold text-base">
              {session.user.createdAt
                ? new Date(session.user.createdAt).toLocaleDateString()
                : "—"}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
