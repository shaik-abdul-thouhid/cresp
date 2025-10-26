import { cookies } from "next/headers";
import { db } from "~/server/db";
import { generateToken } from "./jwt";

/**
 * Updates the auth token cookie with fresh user data from the database
 * Use this whenever user data changes (onboarding, profile updates, etc.)
 */
export async function updateAuthToken(userId: string): Promise<void> {
	try {
		// Fetch fresh user data from database
		const user = await db.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				username: true,
				onboardingCompleted: true,
			},
		});

		if (!user) {
			throw new Error("User not found");
		}

		// Generate new token with fresh data
		const newToken = generateToken({
			userId: user.id,
			email: user.email,
			username: user.username,
			onboardingCompleted: user.onboardingCompleted,
		});

		// Update cookie
		const cookieStore = await cookies();
		cookieStore.set("auth-token", newToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 7 * 24 * 60 * 60, // 7 days
			path: "/",
		});
	} catch (error) {
		console.error("Error updating auth token:", error);
		throw error;
	}
}
