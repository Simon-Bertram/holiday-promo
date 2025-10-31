import { db } from "@holiday-promo/db";
import { todo } from "@holiday-promo/db/schema/todo";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import z from "zod";
import { publicProcedure } from "../index";

export const todoRouter = {
  getAll: publicProcedure.handler(async () => {
    // Let database errors bubble up to error boundary
    return await db.select().from(todo);
  }),

  create: publicProcedure
    .input(z.object({ text: z.string().min(1) }))
    .handler(async ({ input }) => {
      // Let database errors bubble up to error boundary
      return await db.insert(todo).values({
        text: input.text,
      });
    }),

  toggle: publicProcedure
    .input(z.object({ id: z.number(), completed: z.boolean() }))
    .handler(async ({ input }) => {
      const result = await db
        .update(todo)
        .set({ completed: input.completed })
        .where(eq(todo.id, input.id))
        .returning();

      // Handle expected error - resource not found
      if (result.length === 0) {
        throw new ORPCError("NOT_FOUND", {
          message: "Todo not found",
        });
      }

      return result[0];
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .handler(async ({ input }) => {
      const result = await db
        .delete(todo)
        .where(eq(todo.id, input.id))
        .returning();

      // Handle expected error - resource not found
      if (result.length === 0) {
        throw new ORPCError("NOT_FOUND", {
          message: "Todo not found",
        });
      }

      return { success: true };
    }),
};
