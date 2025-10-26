/**
 * Moderation System Constants
 * These match the seeded moderation categories in prisma/seed.sql
 */

// ============================================
// MODERATION CATEGORY KEYS
// ============================================
export const ModerationCategoryKeys = {
	AI_UNDISCLOSED: "ai_undisclosed",
	NSFW: "nsfw",
	SPAM: "spam",
	HARASSMENT: "harassment",
	COPYRIGHT: "copyright",
	MISINFORMATION: "misinformation",
	FAKE_CONTENT: "fake_content",
	OFF_TOPIC: "off_topic",
	HATE_SPEECH: "hate_speech",
	SELF_HARM: "self_harm",
	OTHER: "other",
} as const;

export type ModerationCategoryKey =
	(typeof ModerationCategoryKeys)[keyof typeof ModerationCategoryKeys];

// ============================================
// MODERATION AUTO ACTIONS
// ============================================
export const ModerationAutoActions = {
	WARN: "warn",
	REMOVE: "remove",
	BAN: "ban",
} as const;

export type ModerationAutoAction =
	(typeof ModerationAutoActions)[keyof typeof ModerationAutoActions];

// ============================================
// MODERATION CATEGORY METADATA (Read-only reference)
// ============================================
// These are seeded in the database and can be modified by admins
// This is just a reference for type safety and default values
export const ModerationCategoryMetadata = {
	[ModerationCategoryKeys.AI_UNDISCLOSED]: {
		name: "AI Content Not Disclosed",
		description:
			"Content appears to be AI-generated but user did not disclose it",
		severity: 2,
		autoAction: null,
		requiresProof: false,
		icon: "🤖",
		color: "#f59e0b",
	},
	[ModerationCategoryKeys.NSFW]: {
		name: "NSFW Content",
		description:
			"Content contains nudity, sexual content, or graphic violence",
		severity: 4,
		autoAction: ModerationAutoActions.REMOVE,
		requiresProof: false,
		icon: "🔞",
		color: "#ef4444",
	},
	[ModerationCategoryKeys.SPAM]: {
		name: "Spam",
		description:
			"Unsolicited advertising, repeated posts, or promotional content",
		severity: 3,
		autoAction: ModerationAutoActions.WARN,
		requiresProof: false,
		icon: "📧",
		color: "#f97316",
	},
	[ModerationCategoryKeys.HARASSMENT]: {
		name: "Harassment",
		description:
			"Bullying, threatening, or targeting individuals or groups",
		severity: 5,
		autoAction: ModerationAutoActions.BAN,
		requiresProof: true,
		icon: "⚠️",
		color: "#dc2626",
	},
	[ModerationCategoryKeys.COPYRIGHT]: {
		name: "Copyright Violation",
		description: "Content uses copyrighted material without permission",
		severity: 4,
		autoAction: ModerationAutoActions.REMOVE,
		requiresProof: true,
		icon: "©️",
		color: "#8b5cf6",
	},
	[ModerationCategoryKeys.MISINFORMATION]: {
		name: "Misinformation",
		description: "Deliberately false or misleading information",
		severity: 3,
		autoAction: null,
		requiresProof: true,
		icon: "❌",
		color: "#dc2626",
	},
	[ModerationCategoryKeys.FAKE_CONTENT]: {
		name: "Fake/Manipulated Content",
		description: "Deepfakes, altered images, or fabricated content",
		severity: 5,
		autoAction: ModerationAutoActions.REMOVE,
		requiresProof: true,
		icon: "🎭",
		color: "#be123c",
	},
	[ModerationCategoryKeys.OFF_TOPIC]: {
		name: "Off-Topic Content",
		description: "Content not related to creative work or collaboration",
		severity: 1,
		autoAction: null,
		requiresProof: false,
		icon: "📍",
		color: "#6b7280",
	},
	[ModerationCategoryKeys.HATE_SPEECH]: {
		name: "Hate Speech",
		description:
			"Content promoting hate or discrimination based on identity",
		severity: 5,
		autoAction: ModerationAutoActions.BAN,
		requiresProof: true,
		icon: "🚫",
		color: "#991b1b",
	},
	[ModerationCategoryKeys.SELF_HARM]: {
		name: "Self-Harm Content",
		description: "Content promoting or glorifying self-harm or suicide",
		severity: 5,
		autoAction: ModerationAutoActions.REMOVE,
		requiresProof: false,
		icon: "💔",
		color: "#7f1d1d",
	},
	[ModerationCategoryKeys.OTHER]: {
		name: "Other",
		description: "Other issues not covered by specific categories",
		severity: 1,
		autoAction: null,
		requiresProof: false,
		icon: "📝",
		color: "#9ca3af",
	},
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all active moderation category keys
 */
export function getModerationCategoryKeys(): ModerationCategoryKey[] {
	return Object.values(ModerationCategoryKeys);
}

/**
 * Check if a category key is valid
 */
export function isValidModerationCategory(
	key: string
): key is ModerationCategoryKey {
	return getModerationCategoryKeys().includes(key as ModerationCategoryKey);
}

/**
 * Get category metadata by key
 */
export function getCategoryMetadata(key: ModerationCategoryKey) {
	return ModerationCategoryMetadata[key];
}

/**
 * Sort categories by severity (high to low)
 */
export function sortCategoriesBySeverity(
	keys: ModerationCategoryKey[]
): ModerationCategoryKey[] {
	return keys.sort((a, b) => {
		const severityA = ModerationCategoryMetadata[a].severity;
		const severityB = ModerationCategoryMetadata[b].severity;
		return severityB - severityA;
	});
}

/**
 * Get categories that require proof
 */
export function getCategoriesRequiringProof(): ModerationCategoryKey[] {
	return getModerationCategoryKeys().filter(
		(key) => ModerationCategoryMetadata[key].requiresProof
	);
}

/**
 * Get categories by severity level
 */
export function getCategoriesBySeverity(
	minSeverity: number,
	maxSeverity = 5
): ModerationCategoryKey[] {
	return getModerationCategoryKeys().filter((key) => {
		const severity = ModerationCategoryMetadata[key].severity;
		return severity >= minSeverity && severity <= maxSeverity;
	});
}
