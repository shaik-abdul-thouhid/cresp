import type { Prisma } from "@prisma/client";
import { db } from "~/server/db";

// ============================================
// ACTION CATEGORIES
// ============================================
// These constants match the actions defined in prisma/seed.sql
export const ActivityActions = {
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

	// Referral actions
	REFERRAL_GENERATE: "referral.generate",
	REFERRAL_VIEW: "referral.view",
	REFERRAL_CLICK: "referral.click",
	REFERRAL_SIGNUP: "referral.signup",

	// Onboarding actions
	ONBOARDING_COMPLETE: "onboarding.complete",
	ONBOARDING_SKIP: "onboarding.skip",

	// Additional activity actions (not in seed.sql but used for logging)
	AUTH_EMAIL_VERIFIED: "auth.email_verified", // Used when email is verified
	AUTH_VERIFICATION_EMAIL_REQUESTED: "auth.verification_email_requested", // Used when verification email is requested
	AUTH_VERIFICATION_EMAIL_RESENT: "auth.verification_email_resent", // Used when verification email is resent
} as const;

export type ActivityAction =
	(typeof ActivityActions)[keyof typeof ActivityActions];

// ============================================
// LOGGING INTERFACE
// ============================================
export interface LogActivityParams {
	userId?: string;
	action: ActivityAction;
	resourceType?: string;
	resourceId?: string;
	changesBefore?: Record<string, unknown>;
	changesAfter?: Record<string, unknown>;
	metadata?: Record<string, unknown>;
	status?: "success" | "failure" | "pending";
	errorMessage?: string;
	request?: {
		method?: string;
		endpoint?: string;
		ipAddress?: string;
		userAgent?: string;
		duration?: number;
	};
}

// ============================================
// MAIN LOGGING FUNCTION
// ============================================

/**
 * Log an activity/action to the database
 * @param params - Activity logging parameters
 * @returns Promise<ActivityLog | null>
 */
export async function logActivity(
	params: LogActivityParams
): Promise<{ id: string } | null> {
	try {
		const category = params.action.split(".")[0] || "general";

		const log = await db.activityLog.create({
			data: {
				userId: params.userId,
				action: params.action,
				actionCategory: category,
				resourceType: params.resourceType,
				resourceId: params.resourceId,
				method: params.request?.method,
				endpoint: params.request?.endpoint,
				ipAddress: params.request?.ipAddress
					? anonymizeIp(params.request.ipAddress)
					: undefined,
				userAgent: params.request?.userAgent
					? truncateUserAgent(params.request.userAgent)
					: undefined,
				duration: params.request?.duration,
				status: params.status || "success",
				changesBefore: params.changesBefore
					? (params.changesBefore as Prisma.InputJsonValue)
					: undefined,
				changesAfter: params.changesAfter
					? (params.changesAfter as Prisma.InputJsonValue)
					: undefined,
				metadata: params.metadata
					? (params.metadata as Prisma.InputJsonValue)
					: undefined,
				errorMessage: params.errorMessage,
			},
			select: { id: true },
		});

		return log;
	} catch (error) {
		// Don't throw - logging failures shouldn't break the app
		console.error("Failed to log activity:", error);
		return null;
	}
}

/**
 * Log activity asynchronously (fire and forget)
 * Use this for non-critical logging that shouldn't block requests
 * @param params - Activity logging parameters
 */
export function logActivityAsync(params: LogActivityParams): void {
	// Fire and forget - don't await
	logActivity(params).catch((error) => {
		console.error("Async activity logging failed:", error);
	});
}

/**
 * Batch log multiple activities at once
 * More efficient for bulk operations
 * @param activities - Array of activity parameters
 * @returns Promise<number> - Count of successfully logged activities
 */
export async function logActivitiesBatch(
	activities: LogActivityParams[]
): Promise<number> {
	try {
		const result = await db.activityLog.createMany({
			data: activities.map((params) => {
				const category = params.action.split(".")[0] || "general";
				return {
					userId: params.userId,
					action: params.action,
					actionCategory: category,
					resourceType: params.resourceType,
					resourceId: params.resourceId,
					method: params.request?.method,
					endpoint: params.request?.endpoint,
					ipAddress: params.request?.ipAddress
						? anonymizeIp(params.request.ipAddress)
						: undefined,
					userAgent: params.request?.userAgent
						? truncateUserAgent(params.request.userAgent)
						: undefined,
					duration: params.request?.duration,
					status: params.status || "success",
					changesBefore: params.changesBefore
						? (params.changesBefore as Prisma.InputJsonValue)
						: undefined,
					changesAfter: params.changesAfter
						? (params.changesAfter as Prisma.InputJsonValue)
						: undefined,
					metadata: params.metadata
						? (params.metadata as Prisma.InputJsonValue)
						: undefined,
					errorMessage: params.errorMessage,
				};
			}),
			skipDuplicates: true,
		});

		return result.count;
	} catch (error) {
		console.error("Failed to batch log activities:", error);
		return 0;
	}
}

// ============================================
// QUERY UTILITIES
// ============================================

/**
 * Get user's activity history
 * @param userId - User ID
 * @param options - Query options
 * @returns Promise<ActivityLog[]>
 */
export async function getUserActivityHistory(
	userId: string,
	options?: {
		limit?: number;
		actionCategory?: string;
		status?: string;
		startDate?: Date;
		endDate?: Date;
	}
) {
	return db.activityLog.findMany({
		where: {
			userId,
			...(options?.actionCategory && {
				actionCategory: options.actionCategory,
			}),
			...(options?.status && { status: options.status }),
			...(options?.startDate &&
				options?.endDate && {
					createdAt: {
						gte: options.startDate,
						lte: options.endDate,
					},
				}),
		},
		orderBy: { createdAt: "desc" },
		take: options?.limit || 50,
	});
}

/**
 * Get resource history (who did what to this resource)
 * @param resourceType - Type of resource (e.g., "Post", "Comment")
 * @param resourceId - ID of the resource
 * @param options - Query options
 * @returns Promise with activity logs and user info
 */
export async function getResourceHistory(
	resourceType: string,
	resourceId: string,
	options?: {
		limit?: number;
		includeUser?: boolean;
	}
) {
	return db.activityLog.findMany({
		where: {
			resourceType,
			resourceId,
		},
		include: {
			user: options?.includeUser
				? {
						select: {
							id: true,
							username: true,
							name: true,
							image: true,
						},
				  }
				: false,
		},
		orderBy: { createdAt: "desc" },
		take: options?.limit || 50,
	});
}

/**
 * Get activity statistics for a time range
 * @param timeRange - Start and end dates
 * @returns Promise with grouped statistics
 */
export async function getActivityStats(timeRange: { start: Date; end: Date }) {
	const stats = await db.activityLog.groupBy({
		by: ["actionCategory", "status"],
		where: {
			createdAt: {
				gte: timeRange.start,
				lte: timeRange.end,
			},
		},
		_count: {
			id: true,
		},
	});

	return stats;
}

/**
 * Get activity count by action
 * @param userId - Optional user ID to filter
 * @param timeRange - Optional time range
 * @returns Promise with action counts
 */
export async function getActionCounts(
	userId?: string,
	timeRange?: { start: Date; end: Date }
) {
	return db.activityLog.groupBy({
		by: ["action"],
		where: {
			...(userId && { userId }),
			...(timeRange && {
				createdAt: {
					gte: timeRange.start,
					lte: timeRange.end,
				},
			}),
		},
		_count: {
			id: true,
		},
		orderBy: {
			_count: {
				id: "desc",
			},
		},
	});
}

/**
 * Get recent failed activities
 * Useful for monitoring errors
 * @param options - Query options
 * @returns Promise<ActivityLog[]>
 */
export async function getRecentFailures(options?: {
	limit?: number;
	actionCategory?: string;
}) {
	return db.activityLog.findMany({
		where: {
			status: "failure",
			...(options?.actionCategory && {
				actionCategory: options.actionCategory,
			}),
		},
		include: {
			user: {
				select: {
					id: true,
					username: true,
					email: true,
				},
			},
		},
		orderBy: { createdAt: "desc" },
		take: options?.limit || 50,
	});
}

/**
 * Clean up old activity logs
 * Run this periodically to maintain database size
 * @param olderThanDays - Delete logs older than X days
 * @returns Promise<number> - Count of deleted logs
 */
export async function cleanupOldLogs(olderThanDays = 90) {
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

	const result = await db.activityLog.deleteMany({
		where: {
			createdAt: {
				lt: cutoffDate,
			},
		},
	});

	return result.count;
}

/**
 * Delete all logs for a specific user
 * Used for GDPR compliance / right to erasure
 * @param userId - User ID
 * @returns Promise<number> - Count of deleted logs
 */
export async function deleteUserLogs(userId: string) {
	const result = await db.activityLog.deleteMany({
		where: { userId },
	});

	return result.count;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Anonymize IP address for privacy (mask last octet)
 * @param ip - IP address
 * @returns Anonymized IP
 */
function anonymizeIp(ip: string): string {
	const parts = ip.split(".");
	if (parts.length === 4) {
		// IPv4
		return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
	}
	// For IPv6 or other formats, just truncate
	return ip.substring(0, Math.min(ip.length, 20));
}

/**
 * Truncate user agent string to save space
 * @param userAgent - Full user agent string
 * @returns Truncated user agent
 */
function truncateUserAgent(userAgent: string): string {
	return userAgent.substring(0, 255);
}

/**
 * Extract IP address from request headers
 * @param headers - Request headers
 * @returns IP address or null
 */
export function getIpFromHeaders(headers: Headers): string | undefined {
	// Check common headers used by proxies/CDNs
	return (
		headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
		headers.get("x-real-ip") ||
		headers.get("cf-connecting-ip") || // Cloudflare
		undefined
	);
}

/**
 * Get request metadata for logging
 * @param request - Next.js Request object
 * @returns Request metadata
 */
export function getRequestMetadata(request: Request) {
	const url = new URL(request.url);

	return {
		method: request.method,
		endpoint: url.pathname,
		ipAddress: getIpFromHeaders(request.headers) || undefined,
		userAgent: request.headers.get("user-agent") || undefined,
	};
}
