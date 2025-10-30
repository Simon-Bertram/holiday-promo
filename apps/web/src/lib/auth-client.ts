import type { auth } from "@holiday-promo/auth";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});
