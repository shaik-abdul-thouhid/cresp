"use server";

import { z } from "zod";
import { db } from "~/server/db";

const waitlistSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	feedback: z.string().optional(),
});

export async function joinWaitlist(email: string, feedback?: string) {
	try {
		const validated = waitlistSchema.parse({ email, feedback });

		// Check if email already exists
		const existing = await db.waitlist.findUnique({
			where: { email: validated.email },
		});

		if (existing) {
			return {
				success: false,
				error: "This email is already on the waitlist!",
			};
		}

		// Create waitlist entry
		await db.waitlist.create({
			data: {
				email: validated.email,
				feedback: validated.feedback || null,
				source: "landing_page",
			},
		});

		return { success: true };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				success: false,
				error: error.issues[0]?.message || "Invalid email",
			};
		}

		console.error("Waitlist signup error:", error);
		return {
			success: false,
			error: "Failed to join waitlist. Please try again.",
		};
	}
}
