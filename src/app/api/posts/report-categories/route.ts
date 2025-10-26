import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET() {
	try {
		const categories = await db.moderationCategory.findMany({
			where: {
				isActive: true,
			},
			select: {
				key: true,
				name: true,
				description: true,
				icon: true,
				color: true,
				severity: true,
				requiresProof: true,
			},
			orderBy: {
				displayOrder: "asc",
			},
		});

		return NextResponse.json(categories);
	} catch (error) {
		console.error("Error fetching report categories:", error);
		return NextResponse.json(
			{ error: "Failed to fetch categories" },
			{ status: 500 }
		);
	}
}
