/**
 * Log that a feedback prompt was shown
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

		// Create prompt log
		await db.feedbackPromptLog.create({
			data: {
				userId: user.userId,
				trigger,
			},
		});

		// Log activity
		await logActivity({
			userId: user.userId,
			action: ActivityActions.FEEDBACK_PROMPT_SHOWN,
			metadata: {
				trigger,
			},
		});

		return NextResponse.json({
			success: true,
		});
	} catch (error) {
		console.error("Error logging feedback prompt:", error);
		return NextResponse.json(
			{ error: "Failed to log prompt" },
			{ status: 500 }
		);
	}
}
