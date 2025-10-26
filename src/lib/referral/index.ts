/**
 * Referral System Utilities
 *
 * This module handles:
 * - Generating unique referral codes
 * - Tracking referral clicks
 * - Recording successful signups via referrals
 * - Updating referral milestones
 * - Getting referral statistics
 */

import type { Prisma, ReferralStatus } from "@prisma/client";
import { db } from "~/server/db";

// ============================================
// REFERRAL CODE GENERATION
// ============================================

/**
 * Generate a unique referral code for a user
 * Format: USERNAME_RANDOM6 (e.g., "JOHN_AB12CD")
 */
export async function generateReferralCode(userId: string): Promise<string> {
	// Check if user already has a referral code
	const existing = await db.referralCode.findUnique({
		where: { userId },
	});

	if (existing) {
		return existing.code;
	}

	// Get user's username
	const user = await db.user.findUnique({
		where: { id: userId },
		select: { username: true },
	});

	if (!user) {
		throw new Error("User not found");
	}

	// Generate unique code
	let code: string;
	let attempts = 0;
	const maxAttempts = 10;

	while (attempts < maxAttempts) {
		const randomPart = Math.random()
			.toString(36)
			.substring(2, 8)
			.toUpperCase();
		code = `${user.username.substring(0, 8).toUpperCase()}_${randomPart}`;

		// Check if code already exists
		const existingCode = await db.referralCode.findUnique({
			where: { code },
		});

		if (!existingCode) {
			// Create the referral code
			const newCode = await db.referralCode.create({
				data: {
					userId,
					code,
				},
			});

			return newCode.code;
		}

		attempts++;
	}

	throw new Error("Failed to generate unique referral code");
}

/**
 * Get or create a user's referral code
 */
export async function getOrCreateReferralCode(userId: string): Promise<{
	code: string;
	totalClicks: number;
	totalSignups: number;
	totalConversions: number;
}> {
	const code = await generateReferralCode(userId);

	const referralCode = await db.referralCode.findUnique({
		where: { code },
	});

	if (!referralCode) {
		throw new Error("Referral code not found");
	}

	return {
		code: referralCode.code,
		totalClicks: referralCode.totalClicks,
		totalSignups: referralCode.totalSignups,
		totalConversions: referralCode.totalConversions,
	};
}

// ============================================
// REFERRAL CLICK TRACKING
// ============================================

interface TrackClickParams {
	referralCode: string;
	ipAddress?: string;
	userAgent?: string;
	referrerUrl?: string;
	landingPage?: string;
}

/**
 * Track a click on a referral link (anonymous, before signup)
 */
export async function trackReferralClick(
	params: TrackClickParams
): Promise<void> {
	const { referralCode, ipAddress, userAgent, referrerUrl, landingPage } =
		params;

	// Find the referral code
	const refCode = await db.referralCode.findUnique({
		where: { code: referralCode },
	});

	if (!refCode || !refCode.isActive) {
		return; // Silently fail for inactive/invalid codes
	}

	// Create click record
	await db.referralClick.create({
		data: {
			referralCodeId: refCode.id,
			ipAddress,
			userAgent,
			referrerUrl,
			landingPage,
		},
	});

	// Increment click counter
	await db.referralCode.update({
		where: { id: refCode.id },
		data: {
			totalClicks: {
				increment: 1,
			},
		},
	});
}

// ============================================
// REFERRAL SIGNUP HANDLING
// ============================================

/**
 * Record a successful signup via referral link
 * Call this in the signup API route after creating the user
 */
export async function recordReferralSignup(
	referralCode: string,
	newUserId: string,
	ipAddress?: string
): Promise<void> {
	// Find the referral code
	const refCode = await db.referralCode.findUnique({
		where: { code: referralCode },
		select: {
			id: true,
			userId: true,
			isActive: true,
		},
	});

	if (!refCode || !refCode.isActive) {
		return; // Invalid or inactive code
	}

	// Don't allow self-referrals
	if (refCode.userId === newUserId) {
		return;
	}

	// Check if this user was already referred (shouldn't happen, but safeguard)
	const existingReferral = await db.referral.findUnique({
		where: { referredId: newUserId },
	});

	if (existingReferral) {
		return; // Already referred
	}

	// Create referral record
	await db.referral.create({
		data: {
			referralCodeId: refCode.id,
			referrerId: refCode.userId,
			referredId: newUserId,
			status: "SIGNED_UP",
		},
	});

	// Update referral code counters
	await db.referralCode.update({
		where: { id: refCode.id },
		data: {
			totalSignups: {
				increment: 1,
			},
		},
	});

	// Update the click record if we can match by IP
	if (ipAddress) {
		await db.referralClick.updateMany({
			where: {
				referralCodeId: refCode.id,
				ipAddress,
				convertedToSignup: false,
			},
			data: {
				convertedToSignup: true,
				convertedUserId: newUserId,
				convertedAt: new Date(),
			},
		});
	}
}

// ============================================
// REFERRAL MILESTONE TRACKING
// ============================================

/**
 * Update referral status when the referred user reaches a milestone
 */
export async function updateReferralMilestone(
	userId: string,
	milestone: ReferralStatus
): Promise<void> {
	// Find the referral record for this user
	const referral = await db.referral.findUnique({
		where: { referredId: userId },
		include: {
			referralCode: true,
		},
	});

	if (!referral) {
		return; // User was not referred
	}

	// Update data based on milestone
	const updateData: Prisma.ReferralUpdateInput = {
		status: milestone,
	};

	switch (milestone) {
		case "EMAIL_VERIFIED":
			updateData.emailVerifiedAt = new Date();
			break;
		case "PROFILE_COMPLETED":
			updateData.profileCompletedAt = new Date();
			// Also increment conversion counter
			await db.referralCode.update({
				where: { id: referral.referralCodeId },
				data: {
					totalConversions: {
						increment: 1,
					},
				},
			});
			break;
		case "FIRST_POST":
			updateData.firstPostAt = new Date();
			break;
		case "FIRST_COLLABORATION":
			updateData.firstCollaborationAt = new Date();
			break;
	}

	// Update the referral record
	await db.referral.update({
		where: { id: referral.id },
		data: updateData,
	});
}

// ============================================
// REFERRAL STATISTICS
// ============================================

/**
 * Get detailed referral statistics for a user
 */
export async function getReferralStats(userId: string) {
	const referralCode = await db.referralCode.findUnique({
		where: { userId },
		include: {
			referrals: {
				include: {
					referred: {
						select: {
							id: true,
							username: true,
							name: true,
							image: true,
							createdAt: true,
						},
					},
				},
				orderBy: {
					signedUpAt: "desc",
				},
			},
		},
	});

	if (!referralCode) {
		return null;
	}

	// Calculate conversion rate
	const conversionRate =
		referralCode.totalClicks > 0
			? (referralCode.totalSignups / referralCode.totalClicks) * 100
			: 0;

	// Group referrals by status
	const referralsByStatus = referralCode.referrals.reduce((acc, ref) => {
		acc[ref.status] = (acc[ref.status] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);

	return {
		code: referralCode.code,
		totalClicks: referralCode.totalClicks,
		totalSignups: referralCode.totalSignups,
		totalConversions: referralCode.totalConversions,
		conversionRate: Math.round(conversionRate * 100) / 100,
		referralsByStatus,
		recentReferrals: referralCode.referrals.slice(0, 10).map((ref) => ({
			id: ref.id,
			status: ref.status,
			signedUpAt: ref.signedUpAt,
			user: ref.referred,
		})),
	};
}

/**
 * Check if a user was referred and by whom
 */
export async function getReferrerInfo(userId: string) {
	const referral = await db.referral.findUnique({
		where: { referredId: userId },
		include: {
			referrer: {
				select: {
					id: true,
					username: true,
					name: true,
					image: true,
				},
			},
		},
	});

	return referral
		? {
				referredBy: referral.referrer,
				referredAt: referral.signedUpAt,
				status: referral.status,
		  }
		: null;
}
