import { db } from "@holiday-promo/db";
import {
  account,
  session,
  user,
  verification,
} from "@holiday-promo/db/schema/auth";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth<BetterAuthOptions>({
  database: drizzleAdapter(db, {
    provider: "pg",

    schema: { user, session, account, verification },
  }),
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "subscriber",
        input: false,
      },
    },
  },
  plugins: [nextCookies()],
});
