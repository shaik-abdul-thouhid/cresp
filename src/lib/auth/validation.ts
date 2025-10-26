import { z } from "zod";

// Username: min 8 chars, no spaces, only letters, numbers, -, _
export const usernameSchema = z
	.string()
	.min(8, "Username must be at least 8 characters")
	.max(30, "Username must be less than 30 characters")
	.regex(
		/^[a-zA-Z0-9_-]+$/,
		"Username can only contain letters, numbers, hyphens, and underscores"
	)
	.regex(/^[a-zA-Z]/, "Username must start with a letter");

export const emailSchema = z
	.string()
	.email("Invalid email address")
	.min(5, "Email is too short")
	.max(255, "Email is too long");

export const passwordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters")
	.max(128, "Password must be less than 128 characters")
	.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
	.regex(/[0-9]/, "Password must contain at least one number");

export const signupSchema = z.object({
	username: usernameSchema,
	email: emailSchema,
	password: passwordSchema,
});

// Login accepts either email or username
export const loginSchema = z.object({
	email: z
		.string()
		.min(1, "Email or username is required")
		.max(255, "Email or username is too long"),
	password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
	email: emailSchema,
});

export const resetPasswordSchema = z.object({
	token: z.string().min(1, "Token is required"),
	password: passwordSchema,
});

export const verifyEmailSchema = z.object({
	token: z.string().min(1, "Token is required"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
