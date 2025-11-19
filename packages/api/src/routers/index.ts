import type { RouterClient } from "@orpc/server";
import { protectedProcedure, publicProcedure } from "../index";
import { todoRouter } from "./todo";
import { userRouter } from "./user";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => "OK"),
  privateData: protectedProcedure.handler(({ context }) => {
    // Simple data transformation - let errors bubble up
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),
  todo: todoRouter,
  user: userRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
