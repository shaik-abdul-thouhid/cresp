import { NextResponse } from "next/server";
import { generateResetPasswordToken } from "~/lib/auth/jwt";
import { forgotPasswordSchema } from "~/lib/auth/validation";
import { sendPasswordResetEmail } from "~/lib/email/sendgrid";
import { ActivityActions, logActivity, logError } from "~/lib/logging/helpers";
import { db } from "~/server/db";

export async function POST(request: Request) {
	try {
		const body = await request.json();

		// Validate input
		const validation = forgotPasswordSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{
					error:
						validation.error.errors[0]?.message || "Invalid input",
				},
				{ status: 400 }
			);
		}

		const { email } = validation.data;

		// Find user
		const user = await db.user.findUnique({
			where: { email },
		});

		// Always return success to prevent email enumeration
		// But only send email if user exists
		if (user) {
			// Generate reset token
			const resetToken = generateResetPasswordToken();

			// Create password reset token (expires in 1 hour)
			await db.passwordResetToken.create({
				data: {
					userId: user.id,
					token: resetToken,
					expiresAt: new Date(Date.now() + 60 * 60 * 1000),
				},
			});

			// Send reset email
			await sendPasswordResetEmail(user.email, user.username, resetToken);

			// Log password reset request
			try {
				await logActivity({
					userId: user.id,
					action: ActivityActions.AUTH_PASSWORD_RESET_REQUEST,
					status: "success",
					request: {
						method: "POST",
						endpoint: "/api/auth/forgot-password",
						ipAddress:
							request.headers
								.get("x-forwarded-for")
								?.split(",")[0] ||
							request.headers.get("x-real-ip") ||
							undefined,
						userAgent:
							request.headers.get("user-agent") || undefined,
					},
					metadata: {
						email,
					},
				});
			} catch (error) {
				console.error("Error logging password reset request:", error);
				// Don't fail the flow if logging fails
			}
		}

		return NextResponse.json({
			message:
				"If an account exists with that email, you will receive a password reset link.",
		});
	} catch (error) {
		console.error("Forgot password error:", error);

		// Log error
		await logError(error as Error, {
			action: ActivityActions.AUTH_PASSWORD_RESET_REQUEST,
			request,
		});

		return NextResponse.json(
			{ error: "Something went wrong. Please try again." },
			{ status: 500 }
		);
	}
}
