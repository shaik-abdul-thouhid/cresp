import { type NextRequest, NextResponse } from "next/server";
import { trackReferralClick } from "~/lib/referral";

/**
 * POST /api/referral/track-click
 * Track a click on a referral link (called client-side before signup)
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { code } = body;

		if (!code) {
			return NextResponse.json(
				{ error: "Referral code is required" },
				{ status: 400 }
			);
		}

		// Extract tracking data from request
		const ipAddress =
			request.headers.get("x-forwarded-for")?.split(",")[0] ||
			request.headers.get("x-real-ip") ||
			undefined;
		const userAgent = request.headers.get("user-agent") || undefined;
		const referrerUrl = request.headers.get("referer") || undefined;
		const landingPage = new URL(request.url).pathname;

		await trackReferralClick({
			referralCode: code,
			ipAddress,
			userAgent,
			referrerUrl,
			landingPage,
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error tracking referral click:", error);
		// Don't fail the request, just log the error
		return NextResponse.json({ success: false }, { status: 200 });
	}
}
