/**
 * Log feedback prompt dismissal
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
		const { trigger } = body;

		if (!trigger) {
			return NextResponse.json(
				{ error: "Trigger required" },
				{ status: 400 }
			);
		}

		// Mark latest prompt as dismissed
		await db.feedbackPromptLog.updateMany({
			where: {
				userId: user.userId,
				trigger,
				dismissed: false,
			},
			data: {
				dismissed: true,
			},
		});

		// Log activity
		await logActivity({
			userId: user.userId,
			action: ActivityActions.FEEDBACK_PROMPT_DISMISSED,
			metadata: {
				trigger,
			},
		});

		return NextResponse.json({
			success: true,
		});
	} catch (error) {
		console.error("Error dismissing feedback:", error);
		return NextResponse.json(
			{ error: "Failed to dismiss feedback" },
			{ status: 500 }
		);
	}
}
