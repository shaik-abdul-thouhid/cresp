import { NextResponse } from "next/server";
import { getCurrentUser } from "~/lib/auth/get-user";
import { getReferralStats } from "~/lib/referral";

/**
 * GET /api/referral/stats
 * Get detailed referral statistics for the authenticated user
 */
export async function GET() {
	try {
		const user = await getCurrentUser();

		if (!user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const stats = await getReferralStats(user.userId);

		if (!stats) {
			return NextResponse.json(
				{
					code: null,
					totalClicks: 0,
					totalSignups: 0,
					totalConversions: 0,
					conversionRate: 0,
					referralsByStatus: {},
					recentReferrals: [],
				},
				{ status: 200 }
			);
		}

		return NextResponse.json(stats);
	} catch (error) {
		console.error("Error fetching referral stats:", error);
		return NextResponse.json(
			{ error: "Failed to fetch referral stats" },
			{ status: 500 }
		);
	}
}
