import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_POLICY_MESSAGE =
  "Use pelo menos 10 caracteres, incluindo uma letra e um número.";

export const strongPasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, PASSWORD_POLICY_MESSAGE)
  .max(128, "A senha deve ter no máximo 128 caracteres.")
  .regex(/[A-Za-zÀ-ÖØ-öø-ÿ]/, PASSWORD_POLICY_MESSAGE)
  .regex(/[0-9]/, PASSWORD_POLICY_MESSAGE);

export function getPasswordPolicyError(password: string): string | null {
  const result = strongPasswordSchema.safeParse(password);
  return result.success ? null : result.error.errors[0]?.message ?? PASSWORD_POLICY_MESSAGE;
}

