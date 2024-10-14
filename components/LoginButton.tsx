"use client";

import { useUser } from "@auth0/nextjs-auth0/client";

export default function LoginButton() {
  const { user, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;

  if (user) {
    return (
      <a className="text-white" href="/api/auth/logout">
        Logout
      </a>
    );
  } else {
    return (
      <a
        className="text-white font-bold bg-teal-600 cursor-pointer p-2 rounded-md"
        href="/api/auth/login"
      >
        Login
      </a>
    );
  }
}
