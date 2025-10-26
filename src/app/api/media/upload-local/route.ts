/**
 * Local File Upload (Development Only)
 *
 * Handles direct file uploads when using local storage.
 * In production with cloud storage, use presigned URLs instead.
 */

import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "~/lib/auth/get-user";
import { STORAGE_CONFIG, storageClient } from "~/lib/storage";

export async function POST(req: NextRequest) {
	try {
		// Only allow in development or when using local storage
		if (STORAGE_CONFIG.provider !== "local") {
			return NextResponse.json(
				{ error: "Direct upload is only available for local storage" },
				{ status: 403 }
			);
		}

		// Get current user
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Parse FormData
		const formData = await req.formData();
		const file = formData.get("file") as File;
		const mediaType = formData.get("mediaType") as "image" | "document";

		if (!file) {
			return NextResponse.json(
				{ error: "No file provided" },
				{ status: 400 }
			);
		}

		// Validate file
		const validation = storageClient.validateFile(
			file.size,
			file.type,
			mediaType
		);
		if (!validation.valid) {
			return NextResponse.json(
				{ error: validation.error },
				{ status: 400 }
			);
		}

		// Generate unique storage key
		const key = storageClient.generateKey(
			user.userId,
			mediaType,
			file.name
		);

		// Convert file to buffer
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Upload file
		const result = await storageClient.uploadFile(key, buffer, file.type);

		return NextResponse.json({
			success: true,
			file: {
				key: result.key,
				url: result.url,
				size: result.size,
				mimeType: result.mimeType,
				fileName: file.name,
			},
		});
	} catch (error) {
		console.error("Error uploading file:", error);
		return NextResponse.json(
			{ error: "Failed to upload file" },
			{ status: 500 }
		);
	}
}
