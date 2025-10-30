"use server";

import { getCurrentUser } from "~/lib/auth/get-user";
import { db } from "~/server/db";

export async function getCurrentUserProfessionalRoles() {
	try {
		const currentUser = await getCurrentUser();

		if (!currentUser) {
			return {
				success: false,
				error: "You must be logged in",
				roles: [],
			};
		}

		const roles = await db.userProfessionalRole.findMany({
			where: { userId: currentUser.userId },
			include: {
				professionalRole: true,
			},
			orderBy: [{ isPrimary: "desc" }, { assignedAt: "asc" }],
		});

		return {
			success: true,
			roles: roles.map((r) => ({
				id: r.professionalRole.id,
				name: r.professionalRole.name,
				icon: r.professionalRole.icon,
				key: r.professionalRole.key,
				isPrimary: r.isPrimary,
			})),
		};
	} catch (error) {
		console.error("Error fetching professional roles:", error);
		return {
			success: false,
			error: "Failed to fetch professional roles",
			roles: [],
		};
	}
}
