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

		const roles = await db.userProfessionalRole.findMany({
			where: { userId: currentUser.userId },
			include: {
				professionalRole: true,
			},
			orderBy: [{ isPrimary: "desc" }, { assignedAt: "asc" }],
		});

		const formattedRoles = roles.map((r) => ({
			id: r.professionalRole.id,
			name: r.professionalRole.name,
			icon: r.professionalRole.icon,
			key: r.professionalRole.key,
			isPrimary: r.isPrimary,
		}));

		return NextResponse.json({ roles: formattedRoles });
	} catch (error) {
		console.error("Error fetching professional roles:", error);
		return NextResponse.json(
			{ error: "Failed to fetch professional roles" },
			{ status: 500 }
		);
	}
}

