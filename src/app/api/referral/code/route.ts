import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "~/lib/auth/get-user";
import { getOrCreateReferralCode } from "~/lib/referral";

/**
 * GET /api/referral/code
 * Get or generate the authenticated user's referral code
 */
export async function GET(request: NextRequest) {
	try {
		const user = await getCurrentUser();

		if (!user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const referralData = await getOrCreateReferralCode(user.userId);

		// Generate shareable link - use current request's host for dynamic URL
		// Get the host from headers (more reliable for proxied/forwarded requests)
		const host = request.headers.get("host") || request.nextUrl.host;
		const protocol =
			request.headers.get("x-forwarded-proto") ||
			request.nextUrl.protocol.replace(":", "");
		const baseUrl = `${protocol}://${host}`;

		console.log("baseUrl", baseUrl);
		console.log("host from header", request.headers.get("host"));
		console.log("protocol", protocol);

		const referralLink = `${baseUrl}/join?ref=${referralData.code}`;

		return NextResponse.json({
			code: referralData.code,
			link: referralLink,
			stats: {
				clicks: referralData.totalClicks,
				signups: referralData.totalSignups,
				conversions: referralData.totalConversions,
			},
		});
	} catch (error) {
		console.error("Error generating referral code:", error);
		return NextResponse.json(
			{ error: "Failed to generate referral code" },
			{ status: 500 }
		);
	}
}
