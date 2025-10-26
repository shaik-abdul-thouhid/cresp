import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	/**
	 * Specify your server-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars.
	 */
	server: {
		DATABASE_URL: z.string().url(),
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
		JWT_SECRET: z.string().min(1),
		// SendGrid is optional for prototype mode
		SENDGRID_API_KEY: z.string().min(1).optional(),
		FROM_EMAIL: z.string().email().optional(),
		// Legacy - optional, auto-detected from request if not set
		NEXTAUTH_URL: z.string().url().optional(),
	},

	/**
	 * Specify your client-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars. To expose them to the client, prefix them with
	 * `NEXT_PUBLIC_`.
	 */
	client: {
		// App URL - optional, auto-detected from request host if not set
		// Use this for local network testing (e.g., http://192.168.1.100:3000)
		NEXT_PUBLIC_APP_URL: z.string().url().optional(),
	},

	/**
	 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
	 * middlewares) or client-side so we need to destruct manually.
	 */
	runtimeEnv: {
		DATABASE_URL: process.env.DATABASE_URL,
		NODE_ENV: process.env.NODE_ENV,
		JWT_SECRET: process.env.JWT_SECRET,
		SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
		FROM_EMAIL: process.env.FROM_EMAIL,
		NEXTAUTH_URL: process.env.NEXTAUTH_URL,
		NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
	},
	/**
	 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
	 * useful for Docker builds.
	 */
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	/**
	 * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
	 * `SOME_VAR=''` will throw an error.
	 */
	emptyStringAsUndefined: true,
});
