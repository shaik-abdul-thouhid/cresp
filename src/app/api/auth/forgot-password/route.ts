import {
	errorResponse,
	extractRequestMetadata,
	successResponse,
	validationErrorResponse,
} from "~/lib/api/utils";
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
			return validationErrorResponse(validation.error);
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
				const requestMetadata = extractRequestMetadata(request);
				await logActivity({
					userId: user.id,
					action: ActivityActions.AUTH_PASSWORD_RESET_REQUEST,
					status: "success",
					request: {
						method: "POST",
						endpoint: "/api/auth/forgot-password",
						...requestMetadata,
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

		return successResponse({
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

		return errorResponse("Something went wrong. Please try again.");
	}
}
