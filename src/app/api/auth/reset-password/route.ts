import { NextResponse } from "next/server";
import { hashPassword } from "~/lib/auth/password";
import { resetPasswordSchema } from "~/lib/auth/validation";
import { ActivityActions, logActivity, logError } from "~/lib/logging/helpers";
import { db } from "~/server/db";

export async function POST(request: Request) {
	try {
		const body = await request.json();

		// Validate input
		const validation = resetPasswordSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{
					error:
						validation.error.errors[0]?.message || "Invalid input",
				},
				{ status: 400 }
			);
		}

		const { token, password } = validation.data;

		// Find reset token
		const resetToken = await db.passwordResetToken.findUnique({
			where: { token },
			include: {
				user: {
					include: {
						authAccount: true,
					},
				},
			},
		});

		if (!resetToken) {
			return NextResponse.json(
				{ error: "Invalid reset token" },
				{ status: 400 }
			);
		}

		// Check if token is expired
		if (resetToken.expiresAt < new Date()) {
			return NextResponse.json(
				{ error: "Reset token has expired" },
				{ status: 400 }
			);
		}

		// Check if token was already consumed
		if (resetToken.consumedAt) {
			return NextResponse.json(
				{ error: "Reset token already used" },
				{ status: 400 }
			);
		}

		// Hash new password
		const hashedPassword = await hashPassword(password);

		// Update password in auth account and consume token
		await db.$transaction([
			db.authAccount.update({
				where: { userId: resetToken.userId },
				data: { passwordHash: hashedPassword },
			}),
			db.passwordResetToken.update({
				where: { id: resetToken.id },
				data: { consumedAt: new Date() },
			}),
		]);

		// Log password reset consumption
		try {
			await logActivity({
				userId: resetToken.userId,
				action: ActivityActions.AUTH_PASSWORD_RESET_CONSUME,
				status: "success",
				request: {
					method: "POST",
					endpoint: "/api/auth/reset-password",
					ipAddress:
						request.headers.get("x-forwarded-for")?.split(",")[0] ||
						request.headers.get("x-real-ip") ||
						undefined,
					userAgent: request.headers.get("user-agent") || undefined,
				},
			});
		} catch (error) {
			console.error("Error logging password reset consumption:", error);
			// Don't fail the flow if logging fails
		}

		return NextResponse.json({
			message:
				"Password reset successfully! You can now log in with your new password.",
		});
	} catch (error) {
		console.error("Reset password error:", error);

		// Log error
		await logError(error as Error, {
			action: ActivityActions.AUTH_PASSWORD_RESET_CONSUME,
			request,
		});

		return NextResponse.json(
			{ error: "Something went wrong. Please try again." },
			{ status: 500 }
		);
	}
}
