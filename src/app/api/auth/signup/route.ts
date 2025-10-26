import { NextResponse } from "next/server";
import {
	errorResponse,
	extractRequestMetadata,
	validationErrorResponse,
} from "~/lib/api/utils";
import { generateVerificationToken } from "~/lib/auth/jwt";
import { hashPassword } from "~/lib/auth/password";
import { signupSchema } from "~/lib/auth/validation";
import {
	ActivityActions,
	logActivity,
	logAuthSignup,
	logError,
} from "~/lib/logging/helpers";
import { recordReferralSignup } from "~/lib/referral";
import { db } from "~/server/db";

export async function POST(request: Request) {
	try {
		const body = await request.json();

		// Extract referral code from cookie if present
		const cookieHeader = request.headers.get("cookie");
		const referralCode = cookieHeader
			?.split("; ")
			.find((c) => c.startsWith("referral_code="))
			?.split("=")[1];

		// Validate input
		const validation = signupSchema.safeParse(body);
		if (!validation.success) {
			return validationErrorResponse(validation.error);
		}

		const { username, email, password } = validation.data;

		// Check if user already exists
		const existingUser = await db.user.findFirst({
			where: {
				OR: [{ email }, { username }],
			},
			include: {
				authAccount: true,
				emailVerificationTokens: {
					where: {
						consumedAt: null,
						expiresAt: {
							gt: new Date(),
						},
					},
					orderBy: {
						createdAt: "desc",
					},
					take: 1,
				},
			},
		});

		if (existingUser) {
			// If email exists but not verified, resend verification email
			if (existingUser.email === email) {
				if (
					existingUser.authAccount &&
					!existingUser.authAccount.isVerified
				) {
					// Generate new verification token
					const newVerificationToken = generateVerificationToken();

					// Create new verification token (expires in 24 hours)
					await db.emailVerificationToken.create({
						data: {
							userId: existingUser.id,
							token: newVerificationToken,
							expiresAt: new Date(
								Date.now() + 24 * 60 * 60 * 1000
							),
						},
					});

					// Log verification email resend request
					try {
						const requestMetadata = extractRequestMetadata(request);
						await logActivity({
							userId: existingUser.id,
							action: ActivityActions.AUTH_VERIFICATION_EMAIL_RESENT,
							status: "success",
							request: {
								method: "POST",
								endpoint: "/api/auth/signup",
								...requestMetadata,
							},
							metadata: {
								reason: "duplicate_signup_unverified",
							},
						});
					} catch (error) {
						console.error(
							"Error logging verification resend:",
							error
						);
						// Don't fail the flow if logging fails
					}

					// PROTOTYPE: Email sending disabled - showing link instead
					// await sendVerificationEmail(
					// 	email,
					// 	existingUser.username,
					// 	newVerificationToken,
					// );

					return NextResponse.json(
						{
							message:
								"Email already registered but not verified. Use the verification link below.",
							needsVerification: true,
							verificationToken: newVerificationToken, // PROTOTYPE: Return token for display
						},
						{ status: 200 }
					);
				}

				return errorResponse(
					"Email already registered and verified. Please login.",
					400
				);
			}

			if (existingUser.username === username) {
				return errorResponse("Username already taken", 400);
			}
		}

		// Hash password
		const hashedPassword = await hashPassword(password);

		// Generate verification token
		const verificationToken = generateVerificationToken();

		// Create user, auth account, verification token, and assign member role in a transaction
		const result = await db.$transaction(async (tx) => {
			// Create user profile
			const user = await tx.user.create({
				data: {
					username,
					email,
				},
			});

			// Create auth account
			await tx.authAccount.create({
				data: {
					userId: user.id,
					passwordHash: hashedPassword,
					isVerified: false,
				},
			});

			// Create verification token (expires in 24 hours)
			await tx.emailVerificationToken.create({
				data: {
					userId: user.id,
					token: verificationToken,
					expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
				},
			});

			// Assign default "member" role to new user
			const memberRole = await tx.role.findUnique({
				where: { key: "member" },
			});

			if (memberRole) {
				await tx.userRole.create({
					data: {
						userId: user.id,
						roleId: memberRole.id,
					},
				});
			}

			return user;
		});

		// PROTOTYPE: Email sending disabled - showing link instead
		// await sendVerificationEmail(email, username, verificationToken);

		// Log successful signup
		await logAuthSignup(result.id, request, {
			username,
			email,
		});

		// Handle referral if present
		if (referralCode) {
			try {
				const { ipAddress } = extractRequestMetadata(request);
				await recordReferralSignup(referralCode, result.id, ipAddress);
			} catch (error) {
				console.error("Error recording referral:", error);
				// Don't fail signup if referral tracking fails
			}
		}

		return NextResponse.json(
			{
				message:
					"Account created successfully! Please use the verification link below.",
				userId: result.id,
				verificationToken, // PROTOTYPE: Return token for display
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Signup error:", error);

		// Log signup error
		await logError(error as Error, {
			action: ActivityActions.AUTH_SIGNUP,
			request,
		});

		return errorResponse("Something went wrong. Please try again.");
	}
}
