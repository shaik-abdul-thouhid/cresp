import { NextResponse } from "next/server";
import { skipOnboardingLogic } from "~/server/actions/onboarding";

export async function POST() {
	try {
		await skipOnboardingLogic();

		return NextResponse.json({ success: true, redirectTo: "/feed" });
	} catch (error) {
		console.error("Error skipping onboarding:", error);
		return NextResponse.json(
			{ error: "Failed to skip onboarding" },
			{ status: 500 }
		);
	}
}
