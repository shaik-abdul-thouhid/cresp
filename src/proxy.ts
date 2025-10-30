import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyToken } from "~/lib/auth/jwt";

// Middleware runs on Node.js runtime by default (required for jsonwebtoken)

const PROTECTED_API_ROUTES = [
	"/api/user/",
	"/api/profile/",
	"/api/posts/",
	"/api/comments/",
	"/api/collaborations/",
	"/api/messages/",
	"/api/media/",
	"/api/feedback/",
] as const;

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const isProtectedApi = PROTECTED_API_ROUTES.some((route) =>
		pathname.startsWith(route)
	);

	// If it's a protected API route, verify authentication
	if (isProtectedApi) {
		const token = request.cookies.get("auth-token")?.value;

		if (!token) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		console.log("token", token);

		const user = verifyToken(token);
		if (!user) {
			return NextResponse.json(
				{ error: "Invalid token" },
				{ status: 401 }
			);
		}

		// Attach user info to headers for API routes to use
		const requestHeaders = new Headers(request.headers);
		requestHeaders.set("x-user-id", user.userId);
		requestHeaders.set("x-user-email", user.email);

		return NextResponse.next({
			request: {
				headers: requestHeaders,
			},
		});
	}

	// For all page requests, add pathname to headers
	const requestHeaders = new Headers(request.headers);
	requestHeaders.set("x-pathname", pathname);

	return NextResponse.next({
		request: {
			headers: requestHeaders,
		},
	});
}

// Run middleware on all routes except static files
export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico, images, manifest (public files)
		 */
		"/((?!_next/static|_next/image|favicon.ico|images|manifest.json|sw.js|workbox-).*)",
	],
};
