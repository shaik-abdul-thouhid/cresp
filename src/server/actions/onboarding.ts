"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "~/lib/auth/get-user";
import { updateAuthToken } from "~/lib/auth/update-token";
import { ActivityActions, logActivity } from "~/lib/logging/helpers";
import { updateReferralMilestone } from "~/lib/referral";
import { db } from "~/server/db";

interface CompleteOnboardingData {
	professionalRoleIds: string[];
	name?: string;
	bio?: string;
	location?: string;
}

// Core business logic without redirect
export async function completeOnboardingLogic(data: CompleteOnboardingData) {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error("Unauthorized");
	}

	try {
		// Update user with onboarding data
		await db.$transaction(async (tx) => {
			// Update user basic info
			await tx.user.update({
				where: { id: user.userId },
				data: {
					name: data.name?.trim() || null,
					bio: data.bio?.trim() || null,
					location: data.location?.trim() || null,
					onboardingCompleted: true,
					updatedAt: new Date(),
				},
			});

			// Add professional roles if any were selected
			if (data.professionalRoleIds.length > 0) {
				await tx.userProfessionalRole.createMany({
					data: data.professionalRoleIds.map((roleId) => ({
						userId: user.userId,
						professionalRoleId: roleId,
					})),
				});
			}
		});

		// Log onboarding completion
		try {
			await logActivity({
				userId: user.userId,
				action: ActivityActions.ONBOARDING_COMPLETE,
				status: "success",
				metadata: {
					professionalRolesCount: data.professionalRoleIds.length,
					hasName: !!data.name?.trim(),
					hasBio: !!data.bio?.trim(),
					hasLocation: !!data.location?.trim(),
				},
			});
		} catch (error) {
			console.error("Error logging onboarding completion:", error);
			// Don't fail onboarding if logging fails
		}

		// Update referral milestone if user was referred
		try {
			await updateReferralMilestone(user.userId, "PROFILE_COMPLETED");
		} catch (error) {
			console.error("Error updating referral milestone:", error);
			// Don't fail onboarding if referral tracking fails
		}

		// Update JWT token with fresh user data (including onboardingCompleted)
		await updateAuthToken(user.userId);

		// Revalidate paths
		revalidatePath("/feed");
		revalidatePath("/journey");

		return { success: true };
	} catch (error) {
		console.error("Error completing onboarding:", error);

		// Log failure
		try {
			await logActivity({
				userId: user.userId,
				action: ActivityActions.ONBOARDING_COMPLETE,
				status: "failure",
				errorMessage:
					error instanceof Error ? error.message : "Unknown error",
			});
		} catch (logError) {
			console.error("Error logging onboarding failure:", logError);
		}

		throw new Error("Failed to complete onboarding");
	}
}

// Server action wrapper with redirect (for direct component use)
export async function completeOnboarding(data: CompleteOnboardingData) {
	await completeOnboardingLogic(data);
	redirect("/feed");
}

// Core business logic without redirect
export async function skipOnboardingLogic() {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error("Unauthorized");
	}

	try {
		// Just mark onboarding as complete without any data
		await db.user.update({
			where: { id: user.userId },
			data: {
				onboardingCompleted: true,
				updatedAt: new Date(),
			},
		});

		// Log onboarding skip
		try {
			await logActivity({
				userId: user.userId,
				action: ActivityActions.ONBOARDING_SKIP,
				status: "success",
				metadata: {
					reason: "user_skipped",
				},
			});
		} catch (error) {
			console.error("Error logging onboarding skip:", error);
			// Don't fail onboarding if logging fails
		}

		// Update JWT token with fresh user data (including onboardingCompleted)
		await updateAuthToken(user.userId);

		// Revalidate paths
		revalidatePath("/feed");
		revalidatePath("/journey");

		return { success: true };
	} catch (error) {
		console.error("Error skipping onboarding:", error);

		// Log failure
		try {
			await logActivity({
				userId: user.userId,
				action: ActivityActions.ONBOARDING_SKIP,
				status: "failure",
				errorMessage:
					error instanceof Error ? error.message : "Unknown error",
			});
		} catch (logError) {
			console.error("Error logging onboarding skip failure:", logError);
		}

		throw new Error("Failed to skip onboarding");
	}
}

// Server action wrapper with redirect (for direct component use)
export async function skipOnboarding() {
	await skipOnboardingLogic();
	redirect("/feed");
}
