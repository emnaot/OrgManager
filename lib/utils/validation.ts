/**
 * Validation utilities for forms and user inputs
 */

import { z } from "zod";
import { PasswordStrength } from "@/lib/types/auth";

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email format");

/**
 * Password validation schema
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

/**
 * Sign up form schema
 */
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

/**
 * Sign in form schema
 */
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

/**
 * Check password strength
 */
export function checkPasswordStrength(password: string): PasswordStrength {
  const errors: string[] = [];
  let strengthScore = 0;

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  } else {
    strengthScore += 1;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  } else {
    strengthScore += 1;
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  } else {
    strengthScore += 1;
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  } else {
    strengthScore += 1;
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character");
  } else {
    strengthScore += 1;
  }

  // Additional strength check for length
  if (password.length >= 12) {
    strengthScore += 1;
  }

  let strength: "weak" | "medium" | "strong";
  if (strengthScore <= 2) {
    strength = "weak";
  } else if (strengthScore <= 4) {
    strength = "medium";
  } else {
    strength = "strong";
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
}

