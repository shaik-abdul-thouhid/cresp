import { db } from "~/server/db";

// ============================================
// PROFESSIONAL ROLE KEYS (matching seed.sql)
// ============================================
export const ProfessionalRoleKeys = {
	// Film & Video
	DIRECTOR: "director",
	CINEMATOGRAPHER: "cinematographer",
	VIDEO_EDITOR: "video_editor",
	PRODUCER: "producer",

	// Acting & Performance
	ACTOR: "actor",
	CHOREOGRAPHER: "choreographer",

	// Writing
	WRITER: "writer",
	SCREENPLAY_WRITER: "screenplay_writer",

	// Music
	SINGER: "singer",
	MUSICIAN: "musician",
	LYRICIST: "lyricist",
	COMPOSER: "composer",

	// Visual Arts
	PHOTOGRAPHER: "photographer",
	GRAPHIC_DESIGNER: "graphic_designer",
	ANIMATOR: "animator",
	VFX_ARTIST: "vfx_artist",
	ART_DIRECTOR: "art_director",

	// Design
	COSTUME_DESIGNER: "costume_designer",
	MAKEUP_ARTIST: "makeup_artist",

	// Audio
	SOUND_DESIGNER: "sound_designer",
} as const;

export type ProfessionalRoleKey =
	(typeof ProfessionalRoleKeys)[keyof typeof ProfessionalRoleKeys];

// ============================================
// PROFESSIONAL ROLE IDs (from seed.sql - for reference)
// ============================================
export const ProfessionalRoleIds = {
	DIRECTOR: "prof_director_001",
	ACTOR: "prof_actor_001",
	WRITER: "prof_writer_001",
	SCREENPLAY_WRITER: "prof_screenplay_001",
	CINEMATOGRAPHER: "prof_cinematographer_001",
	PHOTOGRAPHER: "prof_photographer_001",
	VIDEO_EDITOR: "prof_video_editor_001",
	PRODUCER: "prof_producer_001",
	SINGER: "prof_singer_001",
	MUSICIAN: "prof_musician_001",
	LYRICIST: "prof_lyricist_001",
	COMPOSER: "prof_composer_001",
	SOUND_DESIGNER: "prof_sound_designer_001",
	GRAPHIC_DESIGNER: "prof_graphic_designer_001",
	ANIMATOR: "prof_animator_001",
	VFX_ARTIST: "prof_vfx_artist_001",
	ART_DIRECTOR: "prof_art_director_001",
	COSTUME_DESIGNER: "prof_costume_designer_001",
	MAKEUP_ARTIST: "prof_makeup_artist_001",
	CHOREOGRAPHER: "prof_choreographer_001",
} as const;

// ============================================
// PROFESSIONAL ROLE CATEGORIES
// ============================================
export const ProfessionalCategories = {
	FILM_VIDEO: "film_video",
	FILM_THEATER: "film_theater",
	WRITING: "writing",
	MUSIC: "music",
	VISUAL: "visual",
	DESIGN: "design",
	AUDIO: "audio",
	PERFORMANCE: "performance",
} as const;

export type ProfessionalCategory =
	(typeof ProfessionalCategories)[keyof typeof ProfessionalCategories];

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get all active professional roles
 * @param category - Optional category filter
 * @returns Promise<ProfessionalRole[]>
 */
export async function getAllProfessionalRoles(category?: ProfessionalCategory) {
	return db.professionalRole.findMany({
		where: {
			isActive: true,
			...(category && { category }),
		},
		orderBy: {
			displayOrder: "asc",
		},
	});
}

/**
 * Get professional role by key
 * @param key - The professional role key
 * @returns Promise<ProfessionalRole | null>
 */
export async function getProfessionalRoleByKey(key: ProfessionalRoleKey) {
	return db.professionalRole.findUnique({
		where: { key },
	});
}

/**
 * Get user's professional roles
 * @param userId - The user's ID
 * @returns Promise with professional roles and metadata
 */
export async function getUserProfessionalRoles(userId: string) {
	return db.userProfessionalRole.findMany({
		where: { userId },
		include: {
			professionalRole: true,
		},
		orderBy: [{ isPrimary: "desc" }, { assignedAt: "asc" }],
	});
}

/**
 * Assign professional role to user
 * @param userId - The user's ID
 * @param roleKey - The professional role key
 * @param options - Optional metadata (isPrimary, yearsExperience)
 * @returns Promise<boolean>
 */
export async function assignProfessionalRole(
	userId: string,
	roleKey: ProfessionalRoleKey,
	options?: {
		isPrimary?: boolean;
		yearsExperience?: number;
	}
) {
	try {
		const role = await getProfessionalRoleByKey(roleKey);
		if (!role) {
			console.warn(`Professional role not found: ${roleKey}`);
			return false;
		}

		// If setting as primary, unset other primary roles first
		if (options?.isPrimary) {
			await db.userProfessionalRole.updateMany({
				where: {
					userId,
					isPrimary: true,
				},
				data: {
					isPrimary: false,
				},
			});
		}

		await db.userProfessionalRole.upsert({
			where: {
				userId_professionalRoleId: {
					userId,
					professionalRoleId: role.id,
				},
			},
			create: {
				userId,
				professionalRoleId: role.id,
				isPrimary: options?.isPrimary ?? false,
				yearsExperience: options?.yearsExperience,
			},
			update: {
				isPrimary: options?.isPrimary ?? false,
				yearsExperience: options?.yearsExperience,
			},
		});

		return true;
	} catch (error) {
		console.error("Error assigning professional role:", error);
		return false;
	}
}

/**
 * Assign multiple professional roles to user
 * @param userId - The user's ID
 * @param roleKeys - Array of professional role keys
 * @param primaryRoleKey - Optional key to set as primary
 * @returns Promise<boolean>
 */
export async function assignMultipleProfessionalRoles(
	userId: string,
	roleKeys: ProfessionalRoleKey[],
	primaryRoleKey?: ProfessionalRoleKey
) {
	try {
		const roles = await db.professionalRole.findMany({
			where: {
				key: { in: roleKeys },
				isActive: true,
			},
		});

		if (roles.length === 0) {
			console.warn("No valid professional roles found");
			return false;
		}

		// If primary is set, unset other primary roles first
		if (primaryRoleKey) {
			await db.userProfessionalRole.updateMany({
				where: {
					userId,
					isPrimary: true,
				},
				data: {
					isPrimary: false,
				},
			});
		}

		// Use transaction to assign all roles
		await db.$transaction(
			roles.map((role) =>
				db.userProfessionalRole.upsert({
					where: {
						userId_professionalRoleId: {
							userId,
							professionalRoleId: role.id,
						},
					},
					create: {
						userId,
						professionalRoleId: role.id,
						isPrimary: role.key === primaryRoleKey,
					},
					update: {
						isPrimary: role.key === primaryRoleKey,
					},
				})
			)
		);

		return true;
	} catch (error) {
		console.error("Error assigning multiple professional roles:", error);
		return false;
	}
}

/**
 * Remove professional role from user
 * @param userId - The user's ID
 * @param roleKey - The professional role key
 * @returns Promise<boolean>
 */
export async function removeProfessionalRole(
	userId: string,
	roleKey: ProfessionalRoleKey
) {
	try {
		const role = await getProfessionalRoleByKey(roleKey);
		if (!role) {
			console.warn(`Professional role not found: ${roleKey}`);
			return false;
		}

		await db.userProfessionalRole.delete({
			where: {
				userId_professionalRoleId: {
					userId,
					professionalRoleId: role.id,
				},
			},
		});

		return true;
	} catch (error) {
		console.error("Error removing professional role:", error);
		return false;
	}
}

/**
 * Set primary professional role for user
 * @param userId - The user's ID
 * @param roleKey - The professional role key to set as primary
 * @returns Promise<boolean>
 */
export async function setPrimaryProfessionalRole(
	userId: string,
	roleKey: ProfessionalRoleKey
) {
	try {
		const role = await getProfessionalRoleByKey(roleKey);
		if (!role) {
			console.warn(`Professional role not found: ${roleKey}`);
			return false;
		}

		// Check if user has this role
		const userRole = await db.userProfessionalRole.findUnique({
			where: {
				userId_professionalRoleId: {
					userId,
					professionalRoleId: role.id,
				},
			},
		});

		if (!userRole) {
			console.warn("User does not have this professional role");
			return false;
		}

		// Unset all other primary roles
		await db.userProfessionalRole.updateMany({
			where: {
				userId,
				isPrimary: true,
			},
			data: {
				isPrimary: false,
			},
		});

		// Set this role as primary
		await db.userProfessionalRole.update({
			where: {
				userId_professionalRoleId: {
					userId,
					professionalRoleId: role.id,
				},
			},
			data: {
				isPrimary: true,
			},
		});

		return true;
	} catch (error) {
		console.error("Error setting primary professional role:", error);
		return false;
	}
}

/**
 * Check if user has a specific professional role
 * @param userId - The user's ID
 * @param roleKey - The professional role key
 * @returns Promise<boolean>
 */
export async function userHasProfessionalRole(
	userId: string,
	roleKey: ProfessionalRoleKey
) {
	try {
		const role = await getProfessionalRoleByKey(roleKey);
		if (!role) return false;

		const userRole = await db.userProfessionalRole.findUnique({
			where: {
				userId_professionalRoleId: {
					userId,
					professionalRoleId: role.id,
				},
			},
		});

		return !!userRole;
	} catch (error) {
		console.error("Error checking professional role:", error);
		return false;
	}
}

/**
 * Find users by professional role(s)
 * @param roleKeys - Professional role key(s) to search for
 * @param options - Search options
 * @returns Promise<User[]> with professional roles
 */
export async function findUsersByProfessionalRole(
	roleKeys: ProfessionalRoleKey | ProfessionalRoleKey[],
	options?: {
		primaryOnly?: boolean;
		limit?: number;
		excludeUserId?: string;
	}
) {
	const keys = Array.isArray(roleKeys) ? roleKeys : [roleKeys];

	const roles = await db.professionalRole.findMany({
		where: {
			key: { in: keys },
			isActive: true,
		},
	});

	const roleIds = roles.map((r) => r.id);

	return db.user.findMany({
		where: {
			id: options?.excludeUserId
				? { not: options.excludeUserId }
				: undefined,
			professionalRoles: {
				some: {
					professionalRoleId: { in: roleIds },
					...(options?.primaryOnly && { isPrimary: true }),
				},
			},
		},
		include: {
			professionalRoles: {
				include: {
					professionalRole: true,
				},
			},
		},
		take: options?.limit,
	});
}

/**
 * Get professional roles grouped by category
 * @returns Promise with roles grouped by category
 */
export async function getProfessionalRolesByCategory() {
	const roles = await getAllProfessionalRoles();

	const grouped = roles.reduce((acc, role) => {
		const category = role.category || "other";
		if (!acc[category]) {
			acc[category] = [];
		}
		acc[category].push(role);
		return acc;
	}, {} as Record<string, typeof roles>);

	return grouped;
}

/**
 * Search for complementary professional roles
 * (e.g., directors looking for cinematographers)
 * @param userRoleKey - The user's professional role
 * @returns Suggested complementary role keys
 */
export function getComplementaryRoles(
	userRoleKey: ProfessionalRoleKey
): ProfessionalRoleKey[] {
	const complementaryMap: Record<ProfessionalRoleKey, ProfessionalRoleKey[]> =
		{
			[ProfessionalRoleKeys.DIRECTOR]: [
				ProfessionalRoleKeys.CINEMATOGRAPHER,
				ProfessionalRoleKeys.PRODUCER,
				ProfessionalRoleKeys.SCREENPLAY_WRITER,
				ProfessionalRoleKeys.ACTOR,
			],
			[ProfessionalRoleKeys.ACTOR]: [
				ProfessionalRoleKeys.DIRECTOR,
				ProfessionalRoleKeys.PHOTOGRAPHER,
				ProfessionalRoleKeys.MAKEUP_ARTIST,
			],
			[ProfessionalRoleKeys.WRITER]: [
				ProfessionalRoleKeys.DIRECTOR,
				ProfessionalRoleKeys.PRODUCER,
			],
			[ProfessionalRoleKeys.SCREENPLAY_WRITER]: [
				ProfessionalRoleKeys.DIRECTOR,
				ProfessionalRoleKeys.PRODUCER,
			],
			[ProfessionalRoleKeys.CINEMATOGRAPHER]: [
				ProfessionalRoleKeys.DIRECTOR,
				ProfessionalRoleKeys.VIDEO_EDITOR,
			],
			[ProfessionalRoleKeys.SINGER]: [
				ProfessionalRoleKeys.MUSICIAN,
				ProfessionalRoleKeys.LYRICIST,
				ProfessionalRoleKeys.COMPOSER,
			],
			[ProfessionalRoleKeys.MUSICIAN]: [
				ProfessionalRoleKeys.SINGER,
				ProfessionalRoleKeys.COMPOSER,
			],
			[ProfessionalRoleKeys.LYRICIST]: [
				ProfessionalRoleKeys.SINGER,
				ProfessionalRoleKeys.COMPOSER,
			],
			[ProfessionalRoleKeys.COMPOSER]: [
				ProfessionalRoleKeys.SINGER,
				ProfessionalRoleKeys.MUSICIAN,
			],
			[ProfessionalRoleKeys.PHOTOGRAPHER]: [
				ProfessionalRoleKeys.GRAPHIC_DESIGNER,
				ProfessionalRoleKeys.ART_DIRECTOR,
			],
			[ProfessionalRoleKeys.VIDEO_EDITOR]: [
				ProfessionalRoleKeys.DIRECTOR,
				ProfessionalRoleKeys.VFX_ARTIST,
				ProfessionalRoleKeys.SOUND_DESIGNER,
			],
			// Add defaults for roles without specific complementary roles
			[ProfessionalRoleKeys.PRODUCER]: [],
			[ProfessionalRoleKeys.GRAPHIC_DESIGNER]: [],
			[ProfessionalRoleKeys.ANIMATOR]: [],
			[ProfessionalRoleKeys.VFX_ARTIST]: [],
			[ProfessionalRoleKeys.ART_DIRECTOR]: [],
			[ProfessionalRoleKeys.COSTUME_DESIGNER]: [],
			[ProfessionalRoleKeys.MAKEUP_ARTIST]: [],
			[ProfessionalRoleKeys.CHOREOGRAPHER]: [],
			[ProfessionalRoleKeys.SOUND_DESIGNER]: [],
		};

	return complementaryMap[userRoleKey] || [];
}
