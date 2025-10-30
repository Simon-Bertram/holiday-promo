import { db } from "@holiday-promo/db";
import { todo } from "@holiday-promo/db/schema/todo";
import { eq } from "drizzle-orm";
import z from "zod";
import { ORPCError, publicProcedure } from "../index";

export const todoRouter = {
  getAll: publicProcedure.handler(async () => {
    try {
      return await db.select().from(todo);
    } catch (error) {
      console.error("Error fetching todos:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to fetch todos",
      });
    }
  }),

  create: publicProcedure
    .input(z.object({ text: z.string().min(1) }))
    .handler(async ({ input }) => {
      try {
        return await db.insert(todo).values({
          text: input.text,
        });
      } catch (error) {
        console.error("Error creating todo:", error);
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to create todo",
        });
      }
    }),

  toggle: publicProcedure
    .input(z.object({ id: z.number(), completed: z.boolean() }))
    .handler(async ({ input }) => {
      try {
        const result = await db
          .update(todo)
          .set({ completed: input.completed })
          .where(eq(todo.id, input.id))
          .returning();

        if (result.length === 0) {
          throw new ORPCError("NOT_FOUND", {
            message: "Todo not found",
          });
        }

        return result[0];
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error;
        }
        console.error("Error toggling todo:", error);
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to toggle todo",
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .handler(async ({ input }) => {
      try {
        const result = await db
          .delete(todo)
          .where(eq(todo.id, input.id))
          .returning();

        if (result.length === 0) {
          throw new ORPCError("NOT_FOUND", {
            message: "Todo not found",
          });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error;
        }
        console.error("Error deleting todo:", error);
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to delete todo",
        });
      }
    }),
};
