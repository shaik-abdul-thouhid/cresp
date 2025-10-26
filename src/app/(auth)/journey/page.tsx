import { redirect } from "next/navigation";
import { OnboardingFlow } from "~/components/onboarding/onboarding-flow";
import { getAuthenticatedUser } from "~/lib/auth/get-user";
import { db } from "~/server/db";

export default async function JourneyPage() {
	// OPTIMIZED: Use combined query instead of getCurrentUser() + getFullUserData()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let authData;
	try {
		authData = await getAuthenticatedUser();
	} catch (error) {
		console.error("Failed to fetch user data:", error);
		throw new Error("Unable to load onboarding. Please try again later.");
	}

	if (!authData || !authData.user) {
		redirect("/login");
	}

	const fullUser = authData.user;

	// Check onboarding status from database (not just JWT)
	if (fullUser.onboardingCompleted) {
		redirect("/feed");
	}

	// Fetch all professional roles from database (SSR)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let professionalRoles;
	try {
		professionalRoles = await db.professionalRole.findMany({
			orderBy: {
				name: "asc",
			},
			select: {
				id: true,
				name: true,
				key: true,
				description: true,
				icon: true,
			},
		});
	} catch (error) {
		console.error("Failed to fetch professional roles:", error);
		throw new Error(
			"Unable to load professional roles. Please try again later.",
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black">
			<div className="mx-auto max-w-6xl px-4 py-12">
				<OnboardingFlow
					professionalRoles={professionalRoles}
					username={fullUser.username}
				/>
			</div>
		</div>
	);
}
