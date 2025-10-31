import { NextResponse } from "next/server";
import { getCurrentUser } from "~/lib/auth/get-user";
import { ActivityActions, logActivity } from "~/lib/logging";
import { db } from "~/server/db";

export async function POST(request: Request) {
	const currentUser = await getCurrentUser();
	
	try {
		if (!currentUser) {
			await logActivity({
				action: ActivityActions.USER_REPORT,
				status: "failure",
				errorMessage: "Unauthorized: User not logged in",
			});

			return NextResponse.json(
				{ error: "You must be logged in to report a user" },
				{ status: 401 },
			);
		}

		const body = await request.json();
		const { userId, categoryKey, reason } = body;

		if (!userId || !categoryKey) {
			await logActivity({
				userId: currentUser.userId,
				action: ActivityActions.USER_REPORT,
				status: "failure",
				errorMessage: "Missing required fields",
			});

			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		// Check if user is trying to report themselves
		if (userId === currentUser.userId) {
			await logActivity({
				userId: currentUser.userId,
				action: ActivityActions.USER_REPORT,
				resourceType: "User",
				resourceId: userId,
				status: "failure",
				errorMessage: "User attempted to report themselves",
			});

			return NextResponse.json(
				{ error: "You cannot report your own profile" },
				{ status: 400 },
			);
		}

		// Check if the reported user exists
		const reportedUser = await db.user.findUnique({
			where: { id: userId },
			select: { id: true, username: true },
		});

		if (!reportedUser) {
			await logActivity({
				userId: currentUser.userId,
				action: ActivityActions.USER_REPORT,
				resourceType: "User",
				resourceId: userId,
				status: "failure",
				errorMessage: "Reported user not found",
			});

			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 },
			);
		}

		// Check if category exists
		const category = await db.moderationCategory.findUnique({
			where: { key: categoryKey },
			select: { key: true, name: true, isActive: true, requiresProof: true },
		});

		if (!category || !category.isActive) {
			await logActivity({
				userId: currentUser.userId,
				action: ActivityActions.USER_REPORT,
				resourceType: "User",
				resourceId: userId,
				status: "failure",
				errorMessage: `Invalid report category: ${categoryKey}`,
			});

			return NextResponse.json(
				{ error: "Invalid report category" },
				{ status: 400 },
			);
		}

		// Validate reason if required
		if (category.requiresProof && !reason?.trim()) {
			await logActivity({
				userId: currentUser.userId,
				action: ActivityActions.USER_REPORT,
				resourceType: "User",
				resourceId: userId,
				status: "failure",
				errorMessage: "Missing required details for report",
				metadata: { categoryKey },
			});

			return NextResponse.json(
				{
					error: "Additional details are required for this report type",
				},
				{ status: 400 },
			);
		}

		// Check if user has already reported this profile
		const existingReport = await db.userReport.findUnique({
			where: {
				reportedUserId_reportedBy: {
					reportedUserId: userId,
					reportedBy: currentUser.userId,
				},
			},
		});

		if (existingReport) {
			await logActivity({
				userId: currentUser.userId,
				action: ActivityActions.USER_REPORT,
				resourceType: "User",
				resourceId: userId,
				status: "failure",
				errorMessage: "Duplicate report attempt",
				metadata: { categoryKey },
			});

			return NextResponse.json(
				{ error: "You have already reported this user" },
				{ status: 400 },
			);
		}

		// Create the report
		const report = await db.userReport.create({
			data: {
				reportedUserId: userId,
				reportedBy: currentUser.userId,
				categoryKey,
				reason: reason?.trim() || null,
				status: "PENDING",
				priority: "NORMAL",
			},
		});

		// Log successful report
		await logActivity({
			userId: currentUser.userId,
			action: ActivityActions.USER_REPORT,
			resourceType: "User",
			resourceId: userId,
			status: "success",
			metadata: {
				reportId: report.id,
				categoryKey,
				categoryName: category.name,
				reportedUsername: reportedUser.username,
				hasReason: !!reason,
			},
		});

		return NextResponse.json({
			success: true,
			message: "Report submitted successfully",
		});
	} catch (error) {
		console.error("Error creating user report:", error);

		await logActivity({
			userId: currentUser?.userId,
			action: ActivityActions.USER_REPORT,
			status: "failure",
			errorMessage:
				error instanceof Error ? error.message : "Unknown error occurred",
		});

		return NextResponse.json(
			{ error: "Failed to submit report. Please try again." },
			{ status: 500 },
		);
	}
}
