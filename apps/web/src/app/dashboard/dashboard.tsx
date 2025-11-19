"use client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

type Session = typeof authClient.$Infer.Session;

export default function Dashboard({ session }: { session: Session }) {
  const usersQuery = useQuery(orpc.user.list.queryOptions());

  const sortedUsers = useMemo(
    () =>
      usersQuery.data
        ?.slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ) ?? [],
    [usersQuery.data]
  );

  if (usersQuery.isLoading) {
    return <p>Loading users...</p>;
  }

  if (usersQuery.isError) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-destructive">
        Failed to load users.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-xl">Account</h2>
        <p className="text-muted-foreground">
          Logged in as {session.user.email} ({session.user.role})
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[600px] border-collapse text-left">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 font-medium text-sm uppercase tracking-wide">
                Name
              </th>
              <th className="px-4 py-3 font-medium text-sm uppercase tracking-wide">
                Email
              </th>
              <th className="px-4 py-3 font-medium text-sm uppercase tracking-wide">
                Role
              </th>
              <th className="px-4 py-3 font-medium text-sm uppercase tracking-wide">
                Joined
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
              <tr className="border-border border-t" key={user.id}>
                <td className="px-4 py-3 font-medium text-sm">{user.name}</td>
                <td className="px-4 py-3 text-sm">{user.email}</td>
                <td className="px-4 py-3 text-sm capitalize">{user.role}</td>
                <td className="px-4 py-3 text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
