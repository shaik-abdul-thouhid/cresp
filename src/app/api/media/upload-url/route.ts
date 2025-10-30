import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "~/lib/auth/get-user";
import { storageClient } from "~/lib/storage";

const uploadUrlSchema = z.object({
	fileName: z.string(),
	fileType: z.string(),
	fileSize: z.number(),
	mediaType: z.enum(["image", "document"]),
});

export async function POST(req: NextRequest) {
	try {
		// Get current user
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Parse and validate request body
		const body = await req.json();
		const { fileName, fileType, fileSize, mediaType } =
			uploadUrlSchema.parse(body);

		// Validate file
		const validation = storageClient.validateFile(
			fileSize,
			fileType,
			mediaType
		);
		if (!validation.valid) {
			return NextResponse.json(
				{ error: validation.error },
				{ status: 400 }
			);
		}

		// Generate unique storage key
		const key = storageClient.generateKey(user.userId, mediaType, fileName);

		// Get presigned URL
		const uploadUrl = await storageClient.getPresignedUploadUrl(
			key,
			fileType
		);

		// Return presigned URL and key
		return NextResponse.json({
			uploadUrl,
			key,
			publicUrl: `${process.env.STORAGE_BASE_URL ?? ""}/${key}`,
		});
	} catch (error) {
		console.error("Error generating upload URL:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid request data", details: error.issues },
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ error: "Failed to generate upload URL" },
			{ status: 500 }
		);
	}
}
