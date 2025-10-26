import { db } from "~/server/db";

// ============================================
// ACTION KEYS (matching seed.sql)
// ============================================
export const ActionKeys = {
	// Authentication actions
	AUTH_SIGNUP: "auth.signup",
	AUTH_LOGIN: "auth.login",
	AUTH_EMAIL_VERIFY_REQUEST: "auth.email_verify_request",
	AUTH_EMAIL_VERIFY_CONSUME: "auth.email_verify_consume",
	AUTH_PASSWORD_RESET_REQUEST: "auth.password_reset_request",
	AUTH_PASSWORD_RESET_CONSUME: "auth.password_reset_consume",
	AUTH_PASSWORD_CHANGE: "auth.password_change",
	AUTH_LOGOUT: "auth.logout",
	AUTH_SESSION_INVALIDATE: "auth.session_invalidate",
	AUTH_SESSION_REVOKE: "auth.session_revoke",
} as const;

export type ActionKey = (typeof ActionKeys)[keyof typeof ActionKeys];

// ============================================
// ACTION IDs (from seed.sql - for reference)
// ============================================
export const ActionIds = {
	AUTH_SIGNUP: "action_auth_signup_001",
	AUTH_LOGIN: "action_auth_login_001",
	AUTH_EMAIL_VERIFY_REQUEST: "action_auth_email_verify_request_001",
	AUTH_EMAIL_VERIFY_CONSUME: "action_auth_email_verify_consume_001",
	AUTH_PASSWORD_RESET_REQUEST: "action_auth_password_reset_request_001",
	AUTH_PASSWORD_RESET_CONSUME: "action_auth_password_reset_consume_001",
	AUTH_PASSWORD_CHANGE: "action_auth_password_change_001",
	AUTH_LOGOUT: "action_auth_logout_001",
	AUTH_SESSION_INVALIDATE: "action_auth_session_invalidate_001",
	AUTH_SESSION_REVOKE: "action_auth_session_revoke_001",
} as const;

// ============================================
// ROLE KEYS (matching seed.sql)
// ============================================
// Role Priorities:
// - guest:     0
// - member:    20
// - moderator: 40
// - admin:     60
export const RoleKeys = {
	GUEST: "guest", // Priority: 0
	MEMBER: "member", // Priority: 20
	MODERATOR: "moderator", // Priority: 40
	ADMIN: "admin", // Priority: 60
} as const;

export type RoleKey = (typeof RoleKeys)[keyof typeof RoleKeys];

// ============================================
// ROLE PRIORITIES (for reference)
// ============================================
export const RolePriorities = {
	GUEST: 0,
	MEMBER: 20,
	MODERATOR: 40,
	ADMIN: 60,
} as const;

// ============================================
// ROLE IDs (from seed.sql - for reference)
// ============================================
export const RoleIds = {
	GUEST: "role_guest_001",
	MEMBER: "role_member_001",
	MODERATOR: "role_moderator_001",
	ADMIN: "role_admin_001",
} as const;

// ============================================
// AUTHORIZATION CHECKING FUNCTIONS
// ============================================

/**
 * Check if a user can perform a specific action
 * Checks both explicit authorizations and role hierarchy (minRolePriority)
 * @param userId - The user's ID
 * @param actionKey - The action key to check (e.g., "post.create")
 * @returns Promise<boolean> - True if user can perform the action
 */
export async function canUserPerform(
	userId: string,
	actionKey: ActionKey
): Promise<boolean> {
	try {
		// Get the action from database
		const action = await db.action.findUnique({
			where: { key: actionKey },
		});

		if (!action) {
			console.warn(`Action not found: ${actionKey}`);
			return false;
		}

		// Check for explicit DENY (highest priority)
		const userDeny = await db.authorization.findFirst({
			where: {
				subjectType: "USER",
				subjectId: userId,
				actionId: action.id,
				effect: "DENY",
			},
		});

		if (userDeny) {
			return false; // Explicit deny overrides everything
		}

		// Check direct user authorization (USER subject type)
		const userAuthorization = await db.authorization.findFirst({
			where: {
				subjectType: "USER",
				subjectId: userId,
				actionId: action.id,
				effect: "ALLOW",
			},
		});

		if (userAuthorization) {
			return true;
		}

		// Get user's roles with priorities
		const userRoles = await db.userRole.findMany({
			where: { userId },
			include: {
				role: true,
			},
		});

		// Check for role-based DENY
		for (const userRole of userRoles) {
			const roleDeny = await db.authorization.findFirst({
				where: {
					subjectType: "ROLE",
					subjectId: userRole.role.id,
					actionId: action.id,
					effect: "DENY",
				},
			});

			if (roleDeny) {
				return false;
			}
		}

		// Check if any of the user's roles have explicit authorization
		for (const userRole of userRoles) {
			const roleAuthorization = await db.authorization.findFirst({
				where: {
					subjectType: "ROLE",
					subjectId: userRole.role.id,
					actionId: action.id,
					effect: "ALLOW",
				},
			});

			if (roleAuthorization) {
				return true;
			}
		}

		// ============================================
		// PRIORITY-BASED AUTHORIZATION (NEW)
		// ============================================
		// If action has minRolePriority, check if user's highest role meets it
		if (action.minRolePriority !== null && userRoles.length > 0) {
			const highestPriority = Math.max(
				...userRoles.map((ur) => ur.role.priority)
			);

			if (highestPriority >= action.minRolePriority) {
				return true;
			}
		}

		// ============================================
		// FLEXIBLE CONSTRAINTS (FUTURE)
		// ============================================
		// TODO: Check action.constraints JSON field for:
		// - minLevel, maxLevel (user level requirements)
		// - minCredits (required credits)
		// - creditCost (cost to perform action)
		// - cooldown (time-based restrictions)
		// - maxDaily/maxMonthly (rate limits)
		// - custom conditions

		return false;
	} catch (error) {
		console.error("Error checking user authorization:", error);
		return false;
	}
}

/**
 * Check if a role can perform a specific action
 * @param roleKey - The role key (e.g., "admin", "member")
 * @param actionKey - The action key to check
 * @returns Promise<boolean> - True if role can perform the action
 */
export async function canRolePerform(
	roleKey: RoleKey,
	actionKey: ActionKey
): Promise<boolean> {
	try {
		// Get the role and action from database
		const [role, action] = await Promise.all([
			db.role.findUnique({ where: { key: roleKey } }),
			db.action.findUnique({ where: { key: actionKey } }),
		]);

		if (!role || !action) {
			console.warn(`Role or action not found: ${roleKey}, ${actionKey}`);
			return false;
		}

		// Check if role has authorization for this action
		const authorization = await db.authorization.findFirst({
			where: {
				subjectType: "ROLE",
				subjectId: role.id,
				actionId: action.id,
				effect: "ALLOW",
			},
		});

		return !!authorization;
	} catch (error) {
		console.error("Error checking role authorization:", error);
		return false;
	}
}

/**
 * Get all actions a user can perform
 * @param userId - The user's ID
 * @returns Promise<string[]> - Array of action keys the user can perform
 */
export async function getUserActions(userId: string): Promise<ActionKey[]> {
	try {
		// Get user's roles
		const userRoles = await db.userRole.findMany({
			where: { userId },
			include: {
				role: true,
			},
		});

		const roleIds = userRoles.map((ur) => ur.role.id);

		// Get all authorizations for this user (direct + via roles)
		const authorizations = await db.authorization.findMany({
			where: {
				OR: [
					{
						subjectType: "USER",
						subjectId: userId,
						effect: "ALLOW",
					},
					{
						subjectType: "ROLE",
						subjectId: { in: roleIds },
						effect: "ALLOW",
					},
				],
			},
			include: {
				action: true,
			},
		});

		// Extract unique action keys
		const actionKeys = [
			...new Set(authorizations.map((auth) => auth.action.key)),
		] as ActionKey[];

		return actionKeys;
	} catch (error) {
		console.error("Error getting user actions:", error);
		return [];
	}
}

/**
 * Get all actions a role can perform
 * @param roleKey - The role key
 * @returns Promise<string[]> - Array of action keys the role can perform
 */
export async function getRoleActions(roleKey: RoleKey): Promise<ActionKey[]> {
	try {
		const role = await db.role.findUnique({
			where: { key: roleKey },
		});

		if (!role) {
			console.warn(`Role not found: ${roleKey}`);
			return [];
		}

		const authorizations = await db.authorization.findMany({
			where: {
				subjectType: "ROLE",
				subjectId: role.id,
				effect: "ALLOW",
			},
			include: {
				action: true,
			},
		});

		return authorizations.map((auth) => auth.action.key) as ActionKey[];
	} catch (error) {
		console.error("Error getting role actions:", error);
		return [];
	}
}

/**
 * Check if a user has a specific role
 * @param userId - The user's ID
 * @param roleKey - The role key to check
 * @returns Promise<boolean> - True if user has the role
 */
export async function userHasRole(
	userId: string,
	roleKey: RoleKey
): Promise<boolean> {
	try {
		const role = await db.role.findUnique({
			where: { key: roleKey },
		});

		if (!role) {
			return false;
		}

		const userRole = await db.userRole.findUnique({
			where: {
				userId_roleId: {
					userId,
					roleId: role.id,
				},
			},
		});

		return !!userRole;
	} catch (error) {
		console.error("Error checking user role:", error);
		return false;
	}
}

/**
 * Assign a role to a user
 * @param userId - The user's ID
 * @param roleKey - The role key to assign
 * @returns Promise<boolean> - True if role was assigned successfully
 */
export async function assignRoleToUser(
	userId: string,
	roleKey: RoleKey
): Promise<boolean> {
	try {
		const role = await db.role.findUnique({
			where: { key: roleKey },
		});

		if (!role) {
			console.warn(`Role not found: ${roleKey}`);
			return false;
		}

		await db.userRole.create({
			data: {
				userId,
				roleId: role.id,
			},
		});

		return true;
	} catch (error) {
		console.error("Error assigning role to user:", error);
		return false;
	}
}

/**
 * Remove a role from a user
 * @param userId - The user's ID
 * @param roleKey - The role key to remove
 * @returns Promise<boolean> - True if role was removed successfully
 */
export async function removeRoleFromUser(
	userId: string,
	roleKey: RoleKey
): Promise<boolean> {
	try {
		const role = await db.role.findUnique({
			where: { key: roleKey },
		});

		if (!role) {
			console.warn(`Role not found: ${roleKey}`);
			return false;
		}

		await db.userRole.delete({
			where: {
				userId_roleId: {
					userId,
					roleId: role.id,
				},
			},
		});

		return true;
	} catch (error) {
		console.error("Error removing role from user:", error);
		return false;
	}
}

/**
 * Get all roles assigned to a user
 * @param userId - The user's ID
 * @returns Promise<RoleKey[]> - Array of role keys assigned to the user
 */
export async function getUserRoles(userId: string): Promise<RoleKey[]> {
	try {
		const userRoles = await db.userRole.findMany({
			where: { userId },
			include: {
				role: true,
			},
		});

		return userRoles.map((ur) => ur.role.key) as RoleKey[];
	} catch (error) {
		console.error("Error getting user roles:", error);
		return [];
	}
}

// ============================================
// HELPER: Require specific action permission
// ============================================

/**
 * Throws an error if user cannot perform the action
 * Useful for server actions and API routes
 * @param userId - The user's ID
 * @param actionKey - The action key to check
 * @throws Error if user cannot perform the action
 */
export async function requireAction(
	userId: string,
	actionKey: ActionKey
): Promise<void> {
	const canPerform = await canUserPerform(userId, actionKey);
	if (!canPerform) {
		throw new Error(
			`Unauthorized: User does not have permission to perform ${actionKey}`
		);
	}
}

/**
 * Throws an error if user does not have the required role
 * @param userId - The user's ID
 * @param roleKey - The role key required
 * @throws Error if user does not have the role
 */
export async function requireRole(
	userId: string,
	roleKey: RoleKey
): Promise<void> {
	const hasRole = await userHasRole(userId, roleKey);
	if (!hasRole) {
		throw new Error(`Unauthorized: User does not have role ${roleKey}`);
	}
}
