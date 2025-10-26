/**
 * Activity Logging System
 *
 * Central export point for all logging utilities
 */

export {
	ActivityActions,
	cleanupOldLogs,
	deleteUserLogs,
	getActionCounts,
	getActivityStats,
	getIpFromHeaders,
	getRecentFailures,
	getRequestMetadata,
	getResourceHistory,
	getUserActivityHistory,
	logActivitiesBatch,
	logActivity,
	logActivityAsync,
	type ActivityAction,
	type LogActivityParams,
} from "./activity-logger";

export {
	logApiRoute,
	logAuthLogin,
	logAuthLogout,
	logAuthSignup,
	logEmailVerification,
	logError,
	logPasswordReset,
	logPostCreate,
	logPostDelete,
	logPostUpdate,
	logPostView,
	logProfileUpdate,
	logProfileView,
	logRoleAssignment,
	logRoleRemoval,
	logUserBan,
	withActivityLogging,
} from "./helpers";
