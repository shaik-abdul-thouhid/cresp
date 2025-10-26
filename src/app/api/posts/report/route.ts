import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "~/lib/auth/get-user";
import { db } from "~/server/db";

const reportSchema = z.object({
	postId: z.string(),
	categoryKey: z.string(),
	details: z.string().optional(),
});

export async function POST(request: Request) {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { postId, categoryKey, details } = reportSchema.parse(body);

		// Check if post exists
		const post = await db.post.findUnique({
			where: { id: postId },
			select: { id: true, userId: true },
		});

		if (!post) {
			return NextResponse.json(
				{ error: "Post not found" },
				{ status: 404 }
			);
		}

		// Check if user already reported this post with this category
		const existingReport = await db.moderationReport.findUnique({
			where: {
				postId_reportedBy: {
					postId,
					reportedBy: user.userId,
				},
			},
		});

		if (existingReport) {
			return NextResponse.json(
				{ error: "You have already reported this post" },
				{ status: 400 }
			);
		}

		// Get category info
		const category = await db.moderationCategory.findUnique({
			where: { key: categoryKey },
		});

		if (!category || !category.isActive) {
			return NextResponse.json(
				{ error: "Invalid category" },
				{ status: 400 }
			);
		}

		// Get reporter's reputation and trust score
		const reporter = await db.user.findUnique({
			where: { id: user.userId },
			select: {
				totalReputation: true,
				trustScore: true,
			},
		});

		const reportWeight = reporter?.trustScore || 1.0;

		// Find or create moderation queue entry
		const queueEntry = await db.moderationQueue.upsert({
			where: {
				postId_categoryKey: {
					postId,
					categoryKey,
				},
			},
			create: {
				postId,
				userId: post.userId,
				categoryKey,
				reportCount: 1,
				totalWeight: reportWeight,
				averageWeight: reportWeight,
				priority:
					category.severity >= 4
						? "HIGH"
						: category.severity >= 3
						? "NORMAL"
						: "LOW",
			},
			update: {
				reportCount: {
					increment: 1,
				},
				totalWeight: {
					increment: reportWeight,
				},
			},
		});

		// Update average weight
		await db.moderationQueue.update({
			where: { id: queueEntry.id },
			data: {
				averageWeight: {
					divide: queueEntry.reportCount + 1,
				},
			},
		});

		// Create the report
		await db.moderationReport.create({
			data: {
				queueId: queueEntry.id,
				postId,
				reportedBy: user.userId,
				categoryKey,
				details,
				reportWeight,
				reporterReputation: reporter?.totalReputation || 0,
				reporterTrustScore: reporter?.trustScore || 1.0,
			},
		});

		return NextResponse.json(
			{ message: "Report submitted successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error submitting report:", error);
		return NextResponse.json(
			{ error: "Failed to submit report" },
			{ status: 500 }
		);
	}
}
