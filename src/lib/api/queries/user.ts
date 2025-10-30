/**
 * API Query Functions for User-related data
 * Used with React Query for data fetching and caching
 */

export interface CurrentUser {
	id: string;
	username: string;
	name: string | null;
	email: string;
	image: string | null;
	bio: string | null;
	location: string | null;
	totalReputation: number;
	createdAt: string;
}

export interface ProfessionalRole {
	id: string;
	name: string;
	key: string;
	description: string | null;
	icon: string | null;
	isPrimary?: boolean;
}

export interface ProfessionalRolesResponse {
	roles: ProfessionalRole[];
}

/**
 * Fetch current user data
 */
export async function fetchCurrentUser(): Promise<CurrentUser> {
	const response = await fetch("/api/user/me");
	if (!response.ok) {
		throw new Error("Failed to fetch user data");
	}
	return response.json();
}

/**
 * Fetch all available professional roles
 */
export async function fetchAllProfessionalRoles(): Promise<ProfessionalRolesResponse> {
	const response = await fetch("/api/professional-roles");
	if (!response.ok) {
		throw new Error("Failed to fetch professional roles");
	}
	return response.json();
}

/**
 * Fetch user's current professional roles
 */
export async function fetchUserProfessionalRoles(): Promise<ProfessionalRolesResponse> {
	const response = await fetch("/api/user/professional-roles");
	if (!response.ok) {
		throw new Error("Failed to fetch user professional roles");
	}
	return response.json();
}

/**
 * Update user's professional roles
 */
export async function updateUserProfessionalRoles(
	professionalRoleIds: string[]
): Promise<void> {
	const response = await fetch("/api/user/professional-roles/update", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ professionalRoleIds }),
	});

	if (!response.ok) {
		const data = await response.json();
		throw new Error(data.error || "Failed to update professional roles");
	}
}

