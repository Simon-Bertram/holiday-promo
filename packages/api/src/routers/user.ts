import { db } from "@holiday-promo/db";
import { user } from "@holiday-promo/db/schema/auth";
import { desc } from "drizzle-orm";
import { adminProcedure, protectedProcedure } from "../index";

const defaultUserSelect = {
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
};

export const userRouter = {
  me: protectedProcedure.handler(({ context }) => {
    if (!context.session?.user) {
      throw new Error("Session user is missing");
    }
    return {
      id: context.session.user.id,
      name: context.session.user.name,
      email: context.session.user.email,
      role: context.session.user.role,
    };
  }),
  list: adminProcedure.handler(async () =>
    db.select(defaultUserSelect).from(user).orderBy(desc(user.createdAt))
  ),
};
