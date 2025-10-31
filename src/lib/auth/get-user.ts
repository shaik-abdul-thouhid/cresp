import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "~/server/db";
import { verifyToken, type JWTPayload } from "./jwt";

// Cached version - prevents duplicate queries in the same request
export const getCurrentUser = cache(async (): Promise<JWTPayload | null> => {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get("auth-token")?.value;

		if (!token) {
			return null;
		}

		const payload = verifyToken(token);

		// Optional: Verify user still exists in database and token is still valid
		if (payload) {
			const userExists = await db.user.findUnique({
				where: { id: payload.userId },
				select: { id: true },
			});

			if (!userExists) {
				return null;
			}
		}

		return payload;
	} catch (error) {
		// Suppress errors during build/static generation (expected behavior)
		if (
			!(error instanceof Error) ||
			!error.message?.includes("DYNAMIC_SERVER_USAGE")
		) {
			console.error("Error getting current user:", error);
		}
		return null;
	}
});

// Cached version - prevents duplicate queries in the same request
export const getFullUserData = cache(async (userId: string) => {
	try {
		const user = await db.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				username: true,
				email: true,
				name: true,
				image: true,
				bio: true,
				location: true,
				onboardingCompleted: true,
				createdAt: true,
				authAccount: {
					select: {
						isVerified: true,
						lastLoginAt: true,
					},
				},
				userRoles: {
					select: {
						role: {
							select: {
								id: true,
								key: true,
								name: true,
							},
						},
					},
				},
			},
		});

		return user;
	} catch (error) {
		console.error("Error getting full user data:", error);
		return null;
	}
});

// OPTIMIZED: Combined query - gets JWT payload + full user data in ONE database query
// This replaces getCurrentUser() + getFullUserData() with a single function
export const getAuthenticatedUser = cache(async () => {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get("auth-token")?.value;

		if (!token) {
			return null;
		}

		const payload = verifyToken(token);
		if (!payload) {
			return null;
		}

		// Single optimized query with all needed data
		const user = await db.user.findUnique({
			where: { id: payload.userId },
			select: {
				id: true,
				username: true,
				email: true,
				name: true,
				image: true,
				bio: true,
				location: true,
				onboardingCompleted: true,
				createdAt: true,
				authAccount: {
					select: {
						isVerified: true,
						lastLoginAt: true,
					},
				},
				userRoles: {
					select: {
						role: {
							select: {
								id: true,
								key: true,
								name: true,
							},
						},
					},
				},
			},
		});

		if (!user) {
			return null;
		}

		// Return both payload and user data
		return {
			payload,
			user,
		};
	} catch (error) {
		// Suppress errors during build/static generation (expected behavior)
		if (
			!(error instanceof Error) ||
			!error.message?.includes("DYNAMIC_SERVER_USAGE")
		) {
			console.error("Error getting authenticated user:", error);
		}
		return null;
	}
});

export async function requireAuth(): Promise<JWTPayload> {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error("Unauthorized");
	}

	return user;
}
