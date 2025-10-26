/**
 * Local File Serving (Development Only)
 *
 * Serves uploaded files from local storage during development.
 * In production, files are served directly from CDN/bucket.
 */

import { type NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { STORAGE_CONFIG } from "~/lib/storage/config";

export async function GET(
	request: NextRequest,
	{ params: p }: { params: Promise<{ path: string[] }> }
) {
	try {
		// Only allow in development or when using local storage
		if (STORAGE_CONFIG.provider !== "local") {
			return NextResponse.json(
				{ error: "Local file serving is disabled" },
				{ status: 403 }
			);
		}

		const params = await p;
		const filePath = params.path.join("/");
		const fullPath = join(
			STORAGE_CONFIG.localPath || "./public/uploads",
			filePath
		);

		// Read file
		const fileBuffer = await readFile(fullPath);

		// Determine content type from extension
		const ext = filePath.split(".").pop()?.toLowerCase();
		const contentTypeMap: Record<string, string> = {
			jpg: "image/jpeg",
			jpeg: "image/jpeg",
			png: "image/png",
			gif: "image/gif",
			webp: "image/webp",
			pdf: "application/pdf",
			txt: "text/plain",
			docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		};

		const contentType =
			contentTypeMap[ext || ""] || "application/octet-stream";

		// Return file with appropriate headers
		return new NextResponse(fileBuffer, {
			headers: {
				"Content-Type": contentType,
				"Cache-Control": "public, max-age=31536000, immutable",
			},
		});
	} catch (error) {
		console.error("Error serving file:", error);
		return NextResponse.json({ error: "File not found" }, { status: 404 });
	}
}
