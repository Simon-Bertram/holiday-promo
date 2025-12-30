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
import { magicLink } from "better-auth/plugins";
import { sendMagicLinkEmail } from "./email";

export const auth = betterAuth<BetterAuthOptions>({
  database: drizzleAdapter(db, {
    provider: "pg",

    schema: { user, session, account, verification },
  }),
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "subscriber",
        input: false,
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    facebook: {
      clientId: process.env.META_CLIENT_ID || "",
      clientSecret: process.env.META_CLIENT_SECRET || "",
    },
  },
  plugins: [
    nextCookies(),
    magicLink({
      sendMagicLink: async ({ email, token, url }) => {
        await sendMagicLinkEmail({ email, token, url });
      },
      expiresIn: 300, // 5 minutes
      disableSignUp: false, // Allow automatic signup
    }),
  ],
});
