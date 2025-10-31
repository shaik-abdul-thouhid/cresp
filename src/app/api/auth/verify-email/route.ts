import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "~/lib/email/email-service";
import { ActivityActions, logActivity } from "~/lib/logging/helpers";
import { updateReferralMilestone } from "~/lib/referral";
import { db } from "~/server/db";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { token } = body;

		if (!token) {
			return NextResponse.json(
				{ error: "Verification token is required" },
				{ status: 400 }
			);
		}

		// Find verification token
		const verificationToken = await db.emailVerificationToken.findUnique({
			where: { token },
			include: {
				user: {
					include: {
						authAccount: true,
					},
				},
			},
		});

		if (!verificationToken) {
			return NextResponse.json(
				{ error: "Invalid verification token" },
				{ status: 400 }
			);
		}

		// Check if token is expired
		if (verificationToken.expiresAt < new Date()) {
			return NextResponse.json(
				{ error: "Verification token has expired" },
				{ status: 400 }
			);
		}

		// Check if token was already consumed
		if (verificationToken.consumedAt) {
			return NextResponse.json(
				{ error: "Verification token already used" },
				{ status: 400 }
			);
		}

		// Check if already verified
		if (verificationToken.user.authAccount?.isVerified) {
			return NextResponse.json(
				{ error: "Email already verified" },
				{ status: 400 }
			);
		}

		// Mark auth account as verified and consume token
		await db.$transaction([
			db.authAccount.update({
				where: { userId: verificationToken.userId },
				data: { isVerified: true },
			}),
			db.emailVerificationToken.update({
				where: { id: verificationToken.id },
				data: { consumedAt: new Date() },
			}),
		]);

		// Update referral milestone if user was referred
		try {
			await updateReferralMilestone(
				verificationToken.userId,
				"EMAIL_VERIFIED"
			);
		} catch (error) {
			console.error("Error updating referral milestone:", error);
			// Don't fail verification if referral tracking fails
		}

		// Log email verification activity
		try {
			await logActivity({
				userId: verificationToken.userId,
				action: ActivityActions.AUTH_EMAIL_VERIFIED,
				status: "success",
				request: {
					method: "POST",
					endpoint: "/api/auth/verify-email",
					ipAddress:
						request.headers.get("x-forwarded-for")?.split(",")[0] ||
						request.headers.get("x-real-ip") ||
						undefined,
					userAgent: request.headers.get("user-agent") || undefined,
				},
			});
		} catch (error) {
			console.error("Error logging verification activity:", error);
			// Don't fail verification if logging fails
		}

		// Send welcome email
		try {
			await sendWelcomeEmail(
				verificationToken.user.email,
				verificationToken.user.username
			);
		} catch (error) {
			console.error("Error sending welcome email:", error);
			// Don't fail verification if email sending fails
		}

		return NextResponse.json({
			message: "Email verified successfully! You can now log in.",
		});
	} catch (error) {
		console.error("Email verification error:", error);
		return NextResponse.json(
			{ error: "Something went wrong. Please try again." },
			{ status: 500 }
		);
	}
}
