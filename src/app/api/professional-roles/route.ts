import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET(_req: NextRequest) {
	try {
		const roles = await db.professionalRole.findMany({
			where: {
				isActive: true,
			},
			select: {
				id: true,
				key: true,
				name: true,
				description: true,
				icon: true,
				category: true,
				displayOrder: true,
			},
			orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
		});

		return NextResponse.json({ roles });
	} catch (error) {
		console.error("Error fetching professional roles:", error);
		return NextResponse.json(
			{ error: "Failed to fetch professional roles" },
			{ status: 500 }
		);
	}
}

