import type { SessionWithRole } from "../types";

interface AccountInfoProps {
  session: SessionWithRole;
}

/**
 * Displays the current user's account information
 */
export function AccountInfo({ session }: AccountInfoProps) {
  return (
    <div>
      <h2 className="font-semibold text-xl">Account</h2>
      <p className="text-muted-foreground">
        Logged in as {session.user.email} ({session.user.role})
      </p>
    </div>
  );
}
