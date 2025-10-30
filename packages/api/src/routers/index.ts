import type { RouterClient } from "@orpc/server";
import { ORPCError, protectedProcedure, publicProcedure } from "../index";
import { todoRouter } from "./todo";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => "OK"),
  privateData: protectedProcedure.handler(({ context }) => {
    try {
      return {
        message: "This is private",
        user: context.session?.user,
      };
    } catch (error) {
      console.error("Error in privateData:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to fetch private data",
      });
    }
  }),
  todo: todoRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
