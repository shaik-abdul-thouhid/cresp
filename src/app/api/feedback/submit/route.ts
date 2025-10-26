/**
 * Submit user feedback
 */

import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "~/lib/auth/get-user";
import { ActivityActions, logActivity } from "~/lib/logging";
import { db } from "~/server/db";

export async function POST(req: NextRequest) {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const body = await req.json();
		const { trigger, feedbackType, rating, comment, url } = body;

		if (!trigger || !feedbackType) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Get user agent
		const userAgent = req.headers.get("user-agent");

		// Create feedback in transaction
		await db.$transaction(async (tx) => {
			// Save feedback
			await tx.userFeedback.create({
				data: {
					userId: user.userId,
					feedbackType,
					trigger,
					rating,
					comment,
					url,
					userAgent,
				},
			});

			// Update prompt log to mark as responded
			await tx.feedbackPromptLog.updateMany({
				where: {
					userId: user.userId,
					trigger,
					responded: false,
				},
				data: {
					responded: true,
				},
			});
		});

		// Log activity
		await logActivity({
			userId: user.userId,
			action: ActivityActions.FEEDBACK_SUBMIT,
			metadata: {
				trigger,
				feedbackType,
				rating,
				hasComment: !!comment,
			},
		});

		return NextResponse.json({
			success: true,
			message: "Thank you for your feedback!",
		});
	} catch (error) {
		console.error("Error submitting feedback:", error);
		return NextResponse.json(
			{ error: "Failed to submit feedback" },
			{ status: 500 }
		);
	}
}
