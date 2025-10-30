import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "~/lib/auth/get-user";
import { ActivityActions, logActivity } from "~/lib/logging";
import { db } from "~/server/db";
import { z } from "zod";

const updateRolesSchema = z.object({
	professionalRoleIds: z.array(z.string()).min(1).max(3),
});

export async function POST(req: NextRequest) {
	try {
		const currentUser = await getCurrentUser();

		if (!currentUser) {
			await logActivity({
				action: ActivityActions.PROFESSIONAL_ROLE_UPDATE,
				status: "failure",
				errorMessage: "Unauthorized: User not logged in",
			});

			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const validation = updateRolesSchema.safeParse(body);

		if (!validation.success) {
			await logActivity({
				userId: currentUser.userId,
				action: ActivityActions.PROFESSIONAL_ROLE_UPDATE,
				status: "failure",
				errorMessage: "Invalid professional role selection",
			});

			return NextResponse.json(
				{ error: "Invalid professional role selection. Please select 1-3 roles." },
				{ status: 400 },
			);
		}

		const { professionalRoleIds } = validation.data;

		// Get current roles for logging
		const currentRoles = await db.userProfessionalRole.findMany({
			where: { userId: currentUser.userId },
			select: {
				professionalRoleId: true,
				professionalRole: {
					select: { id: true, name: true, key: true },
				},
			},
		});

		// Verify all roles exist
		const roles = await db.professionalRole.findMany({
			where: {
				id: {
					in: professionalRoleIds,
				},
			},
			select: {
				id: true,
				name: true,
				key: true,
			},
		});

		if (roles.length !== professionalRoleIds.length) {
			await logActivity({
				userId: currentUser.userId,
				action: ActivityActions.PROFESSIONAL_ROLE_UPDATE,
				status: "failure",
				errorMessage: "One or more professional roles are invalid",
			});

			return NextResponse.json(
				{ error: "One or more professional roles are invalid" },
				{ status: 400 },
			);
		}

		// Delete existing roles and create new ones in a transaction
		await db.$transaction([
			// Delete existing roles
			db.userProfessionalRole.deleteMany({
				where: {
					userId: currentUser.userId,
				},
			}),
			// Create new roles
			db.userProfessionalRole.createMany({
				data: professionalRoleIds.map((roleId) => ({
					userId: currentUser.userId,
					professionalRoleId: roleId,
					isPrimary: false,
				})),
			}),
		]);

		// Log successful update
		await logActivity({
			userId: currentUser.userId,
			action: ActivityActions.PROFESSIONAL_ROLE_UPDATE,
			resourceType: "User",
			resourceId: currentUser.userId,
			status: "success",
			changesBefore: {
				roles: currentRoles.map((r) => ({
					id: r.professionalRole.id,
					name: r.professionalRole.name,
					key: r.professionalRole.key,
				})),
			},
			changesAfter: {
				roles: roles.map((r) => ({
					id: r.id,
					name: r.name,
					key: r.key,
				})),
			},
			metadata: {
				roleCount: roles.length,
				rolesAdded: roles.filter(
					(r) => !currentRoles.some((cr) => cr.professionalRoleId === r.id),
				).length,
				rolesRemoved: currentRoles.filter(
					(cr) => !roles.some((r) => r.id === cr.professionalRoleId),
				).length,
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error updating professional roles:", error);

		await logActivity({
			userId: currentUser?.userId,
			action: ActivityActions.PROFESSIONAL_ROLE_UPDATE,
			status: "failure",
			errorMessage:
				error instanceof Error ? error.message : "Unknown error occurred",
		});

		return NextResponse.json(
			{ error: "Failed to update professional roles" },
			{ status: 500 },
		);
	}
}
