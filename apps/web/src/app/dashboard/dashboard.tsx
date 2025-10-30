"use client";
import { useQuery } from "@tanstack/react-query";
import type { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

export default function Dashboard({
  session,
}: {
  session: typeof authClient.$Infer.Session;
}) {
  const privateData = useQuery(orpc.privateData.queryOptions());

  if (privateData.isLoading) {
    return <p>Loading...</p>;
  }

  if (privateData.isError) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-destructive">
        Failed to load data.
      </div>
    );
  }

  return <p>API: {privateData.data?.message}</p>;
}
