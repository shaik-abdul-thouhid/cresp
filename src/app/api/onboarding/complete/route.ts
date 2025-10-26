import { NextResponse } from "next/server";
import { completeOnboardingLogic } from "~/server/actions/onboarding";

export async function POST(request: Request) {
	try {
		const body = await request.json();

		await completeOnboardingLogic(body);

		return NextResponse.json({ success: true, redirectTo: "/feed" });
	} catch (error) {
		console.error("Error completing onboarding:", error);
		return NextResponse.json(
			{ error: "Failed to complete onboarding" },
			{ status: 500 }
		);
	}
}
