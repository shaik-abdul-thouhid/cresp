import { NextResponse } from "next/server";
import type { ZodError } from "zod";

/**
 * Standard error response format
 */
export function errorResponse(
	message: string,
	status = 500
): NextResponse<{ error: string }> {
	return NextResponse.json({ error: message }, { status });
}

/**
 * Standard validation error response from Zod
 */
export function validationErrorResponse(
	error: ZodError
): NextResponse<{ error: string }> {
	const message = error.issues[0]?.message || "Invalid input";
	return errorResponse(message, 400);
}

/**
 * Extract request metadata (IP address and user agent)
 */
export interface RequestMetadata {
	ipAddress?: string;
	userAgent?: string;
}

export function extractRequestMetadata(request: Request): RequestMetadata {
	const ipAddress =
		request.headers.get("x-forwarded-for")?.split(",")[0] ||
		request.headers.get("x-real-ip") ||
		undefined;

	const userAgent = request.headers.get("user-agent") || undefined;

	return { ipAddress, userAgent };
}

/**
 * Standard success response
 */
export function successResponse<T extends Record<string, unknown>>(
	data: T,
	status = 200
): NextResponse<T> {
	return NextResponse.json(data, { status });
}
