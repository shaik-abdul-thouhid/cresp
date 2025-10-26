import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
	errorResponse,
	extractRequestMetadata,
	validationErrorResponse,
} from "~/lib/api/utils";
import { generateToken, generateVerificationToken } from "~/lib/auth/jwt";
import { verifyPassword } from "~/lib/auth/password";
import { loginSchema } from "~/lib/auth/validation";
import {
	ActivityActions,
	logActivity,
	logAuthLogin,
	logError,
} from "~/lib/logging/helpers";
import { db } from "~/server/db";

export async function POST(request: Request) {
	try {
		const body = await request.json();

		// Validate input
		const validation = loginSchema.safeParse(body);
		if (!validation.success) {
			return validationErrorResponse(validation.error);
		}

		const { email, password } = validation.data;

		// Find user with auth account (support both email and username)
		// Check if input is email (contains @) or username
		const isEmail = email.includes("@");

		const user = await db.user.findFirst({
			where: isEmail ? { email } : { username: email }, // If no @, treat as username
			include: {
				authAccount: true,
			},
		});

		if (!user || !user.authAccount) {
			return errorResponse("Invalid email/username or password", 401);
		}

		// Verify password
		const isValidPassword = await verifyPassword(
			password,
			user.authAccount.passwordHash
		);
		if (!isValidPassword) {
			return errorResponse("Invalid email/username or password", 401);
		}

		// Check if email is verified
		if (!user.authAccount.isVerified) {
			// Generate new verification token
			const newVerificationToken = generateVerificationToken();

			// Create new verification token (expires in 24 hours)
			await db.emailVerificationToken.create({
				data: {
					userId: user.id,
					token: newVerificationToken,
					expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
				},
			});

			// Log verification email request
			try {
				const requestMetadata = extractRequestMetadata(request);
				await logActivity({
					userId: user.id,
					action: ActivityActions.AUTH_VERIFICATION_EMAIL_REQUESTED,
					status: "pending",
					request: {
						method: "POST",
						endpoint: "/api/auth/login",
						...requestMetadata,
					},
					metadata: {
						reason: "unverified_email_login_attempt",
					},
				});
			} catch (error) {
				console.error("Error logging verification request:", error);
				// Don't fail the flow if logging fails
			}

			// PROTOTYPE: Email sending disabled - showing link instead
			// await sendVerificationEmail(
			// 	user.email,
			// 	user.username,
			// 	newVerificationToken
			// );

			return NextResponse.json(
				{
					error: "Please verify your email before logging in",
					needsVerification: true,
					message:
						"Use the verification link below to activate your account.",
					verificationToken: newVerificationToken, // PROTOTYPE: Return token for display
				},
				{ status: 403 }
			);
		}

		// Update last login timestamp
		await db.authAccount.update({
			where: { userId: user.id },
			data: { lastLoginAt: new Date() },
		});

		// Generate JWT token
		const token = generateToken({
			userId: user.id,
			email: user.email,
			username: user.username,
			onboardingCompleted: user.onboardingCompleted,
		});

		// Set cookie
		const cookieStore = await cookies();
		cookieStore.set("auth-token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 60 * 60 * 24 * 7, // 7 days
			path: "/",
		});

		// Log successful login
		await logAuthLogin(user.id, request, true);

		return NextResponse.json({
			message: "Login successful",
			userId: user.id,
			onboardingCompleted: user.onboardingCompleted,
		});
	} catch (error) {
		console.error("Login error:", error);

		// Log login error
		await logError(error as Error, {
			action: ActivityActions.AUTH_LOGIN,
			request,
		});

		return errorResponse("Something went wrong. Please try again.");
	}
}
