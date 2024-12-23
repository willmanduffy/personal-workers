import { z } from "zod";

export function safeParse<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    console.error("Zod validation error:", {
      errors: result.error.errors,
      data,
    });
    return data as T;
  }

  return result.data;
}
