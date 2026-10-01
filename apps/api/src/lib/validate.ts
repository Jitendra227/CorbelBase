import { ZodType } from "zod";
import { AppError } from "./app-errors";

export function validate<T>(
  schema: ZodType<T>,
  data: unknown,
  error: () => AppError
): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw error();
  }

  return result.data;
}
