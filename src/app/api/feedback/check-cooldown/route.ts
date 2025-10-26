/**
 * Check if user can be shown a feedback prompt
 * 
 * MVP: 7-day cooldown between prompts
 */

import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { getCurrentUser } from "~/lib/auth/get-user";

const COOLDOWN_DAYS = 7; // MVP: 7 days between prompts

export async function GET(req: NextRequest) {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { searchParams } = new URL(req.url);
		const trigger = searchParams.get("trigger");

		if (!trigger) {
			return NextResponse.json(
				{ error: "Trigger parameter required" },
				{ status: 400 }
			);
		}

		// Check if user has been prompted in the last N days
		const cooldownDate = new Date();
		cooldownDate.setDate(cooldownDate.getDate() - COOLDOWN_DAYS);

		const recentPrompt = await db.feedbackPromptLog.findFirst({
			where: {
				userId: user.userId,
				shownAt: {
					gte: cooldownDate,
				},
			},
			orderBy: {
				shownAt: "desc",
			},
		});

		// Check if user dismissed this specific trigger 3+ times (never show again)
		const dismissCount = await db.feedbackPromptLog.count({
			where: {
				userId: user.userId,
				trigger,
				dismissed: true,
			},
		});

		const canShow = !recentPrompt && dismissCount < 3;

		return NextResponse.json({
			canShow,
			reason: !canShow
				? recentPrompt
					? "Recently shown"
					: "Dismissed too many times"
				: null,
			lastShown: recentPrompt?.shownAt || null,
		});
	} catch (error) {
		console.error("Error checking feedback cooldown:", error);
		return NextResponse.json(
			{ error: "Failed to check cooldown" },
			{ status: 500 }
		);
	}
}

