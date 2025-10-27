/**
 * Helper utilities for activity logging
 * Provides convenient wrappers for common logging scenarios
 */

import type { NextRequest } from "next/server";
import {
	type ActivityAction,
	ActivityActions,
	getRequestMetadata,
	logActivity,
	logActivityAsync,
} from "./activity-logger";

// Re-export core functions for direct use
export { ActivityActions, getRequestMetadata, logActivity, logActivityAsync };
export type { ActivityAction };

// ============================================
// AUTHENTICATION LOGGING HELPERS
// ============================================

export async function logAuthLogin(
	userId: string,
	request?: Request,
	success = true
) {
	return logActivity({
		userId,
		action: ActivityActions.AUTH_LOGIN,
		status: success ? "success" : "failure",
		...(request && { request: getRequestMetadata(request) }),
	});
}

export async function logAuthSignup(
	userId: string,
	request?: Request,
	metadata?: Record<string, unknown>
) {
	return logActivity({
		userId,
		action: ActivityActions.AUTH_SIGNUP,
		metadata,
		...(request && { request: getRequestMetadata(request) }),
	});
}

export async function logAuthLogout(userId: string, request?: Request) {
	return logActivity({
		userId,
		action: ActivityActions.AUTH_LOGOUT,
		...(request && { request: getRequestMetadata(request) }),
	});
}

export async function logEmailVerification(userId: string) {
	return logActivity({
		userId,
		action: ActivityActions.AUTH_VERIFY_EMAIL,
	});
}

export async function logPasswordReset(userId: string) {
	return logActivity({
		userId,
		action: ActivityActions.AUTH_PASSWORD_RESET,
	});
}

// ============================================
// PROFILE LOGGING HELPERS
// ============================================

export async function logProfileUpdate(
	userId: string,
	changesBefore: Record<string, unknown>,
	changesAfter: Record<string, unknown>
) {
	return logActivity({
		userId,
		action: ActivityActions.PROFILE_UPDATE,
		resourceType: "User",
		resourceId: userId,
		changesBefore,
		changesAfter,
	});
}

export async function logProfileView(
	viewerId: string | undefined,
	profileUserId: string
) {
	return logActivityAsync({
		userId: viewerId,
		action: ActivityActions.PROFILE_VIEW,
		resourceType: "User",
		resourceId: profileUserId,
	});
}

// ============================================
// CONTENT LOGGING HELPERS
// ============================================

export async function logPostCreate(
	userId: string,
	postId: string,
	metadata?: Record<string, unknown>
) {
	return logActivity({
		userId,
		action: ActivityActions.POST_CREATE,
		resourceType: "Post",
		resourceId: postId,
		metadata,
	});
}

export async function logPostUpdate(
	userId: string,
	postId: string,
	changesBefore: Record<string, unknown>,
	changesAfter: Record<string, unknown>
) {
	return logActivity({
		userId,
		action: ActivityActions.POST_UPDATE,
		resourceType: "Post",
		resourceId: postId,
		changesBefore,
		changesAfter,
	});
}

export async function logPostDelete(
	userId: string,
	postId: string,
	metadata?: Record<string, unknown>
) {
	return logActivity({
		userId,
		action: ActivityActions.POST_DELETE,
		resourceType: "Post",
		resourceId: postId,
		metadata,
	});
}

export async function logPostView(
	viewerId: string | undefined,
	postId: string
) {
	// Use async for view tracking (don't block)
	return logActivityAsync({
		userId: viewerId,
		action: ActivityActions.POST_VIEW,
		resourceType: "Post",
		resourceId: postId,
	});
}

// ============================================
// ADMIN LOGGING HELPERS
// ============================================

export async function logRoleAssignment(
	adminUserId: string,
	targetUserId: string,
	roleKey: string
) {
	return logActivity({
		userId: adminUserId,
		action: ActivityActions.ADMIN_ROLE_ASSIGN,
		resourceType: "User",
		resourceId: targetUserId,
		metadata: { roleKey },
	});
}

export async function logRoleRemoval(
	adminUserId: string,
	targetUserId: string,
	roleKey: string
) {
	return logActivity({
		userId: adminUserId,
		action: ActivityActions.ADMIN_ROLE_REMOVE,
		resourceType: "User",
		resourceId: targetUserId,
		metadata: { roleKey },
	});
}

export async function logUserBan(
	adminUserId: string,
	targetUserId: string,
	reason?: string
) {
	return logActivity({
		userId: adminUserId,
		action: ActivityActions.ADMIN_USER_BAN,
		resourceType: "User",
		resourceId: targetUserId,
		metadata: { reason },
	});
}

// ============================================
// ERROR LOGGING HELPERS
// ============================================

export async function logError(
	error: Error,
	context: {
		userId?: string;
		action?: ActivityAction;
		resourceType?: string;
		resourceId?: string;
		request?: Request;
	}
) {
	return logActivity({
		userId: context.userId,
		action: context.action || ActivityActions.SYSTEM_ERROR,
		resourceType: context.resourceType,
		resourceId: context.resourceId,
		status: "failure",
		errorMessage: error.message,
		metadata: {
			stack: error.stack,
			name: error.name,
		},
		...(context.request && {
			request: getRequestMetadata(context.request),
		}),
	});
}

// ============================================
// WRAPPER FUNCTIONS
// ============================================

/**
 * Wrap an async function with automatic logging
 * Logs both success and failure
 */
export function withActivityLogging<T, Args extends unknown[]>(
	action: ActivityAction,
	fn: (...args: Args) => Promise<T>,
	options?: {
		getUserId?: (...args: Args) => string | undefined;
		getResourceInfo?: (
			...args: Args
		) => { type: string; id: string } | undefined;
		getMetadata?: (...args: Args) => Record<string, unknown> | undefined;
	}
) {
	return async (...args: Args): Promise<T> => {
		const startTime = Date.now();
		const userId = options?.getUserId?.(...args);
		const resourceInfo = options?.getResourceInfo?.(...args);
		const metadata = options?.getMetadata?.(...args);

		try {
			const result = await fn(...args);

			// Log success
			await logActivity({
				userId,
				action,
				resourceType: resourceInfo?.type,
				resourceId: resourceInfo?.id,
				metadata,
				request: {
					duration: Date.now() - startTime,
				},
			});

			return result;
		} catch (error) {
			// Log failure
			await logActivity({
				userId,
				action,
				resourceType: resourceInfo?.type,
				resourceId: resourceInfo?.id,
				status: "failure",
				errorMessage:
					error instanceof Error ? error.message : String(error),
				metadata,
				request: {
					duration: Date.now() - startTime,
				},
			});

			throw error;
		}
	};
}

/**
 * Log API route activity
 * Use this at the start of API route handlers
 */
export async function logApiRoute(
	request: NextRequest,
	userId?: string,
	options?: {
		action?: ActivityAction;
		resourceType?: string;
		resourceId?: string;
	}
) {
	const metadata = getRequestMetadata(request);

	return logActivityAsync({
		userId,
		action: options?.action || ActivityActions.HTTP_REQUEST,
		resourceType: options?.resourceType,
		resourceId: options?.resourceId,
		request: metadata,
	});
}
