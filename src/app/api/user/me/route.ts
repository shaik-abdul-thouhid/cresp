import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "~/lib/auth/get-user";
import { db } from "~/server/db";

export async function GET(_req: NextRequest) {
	try {
		const currentUser = await getCurrentUser();

		if (!currentUser) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Fetch user details
		const user = await db.user.findUnique({
			where: { id: currentUser.userId },
			select: {
				id: true,
				username: true,
				name: true,
				email: true,
				image: true,
				bio: true,
				location: true,
				totalReputation: true,
				createdAt: true,
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(user);
	} catch (error) {
		console.error("Error fetching user:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
