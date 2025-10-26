import {
	errorResponse,
	extractRequestMetadata,
	successResponse,
	validationErrorResponse,
} from "~/lib/api/utils";
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
			return validationErrorResponse(validation.error);
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
			return errorResponse("Invalid reset token", 400);
		}

		// Check if token is expired
		if (resetToken.expiresAt < new Date()) {
			return errorResponse("Reset token has expired", 400);
		}

		// Check if token was already consumed
		if (resetToken.consumedAt) {
			return errorResponse("Reset token already used", 400);
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
			const requestMetadata = extractRequestMetadata(request);
			await logActivity({
				userId: resetToken.userId,
				action: ActivityActions.AUTH_PASSWORD_RESET_CONSUME,
				status: "success",
				request: {
					method: "POST",
					endpoint: "/api/auth/reset-password",
					...requestMetadata,
				},
			});
		} catch (error) {
			console.error("Error logging password reset consumption:", error);
			// Don't fail the flow if logging fails
		}

		return successResponse({
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

		return errorResponse("Something went wrong. Please try again.");
	}
}
