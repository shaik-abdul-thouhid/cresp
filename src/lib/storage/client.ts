/**
 * Universal Storage Client
 *
 * Provides a unified interface for different storage providers.
 * Switch providers by changing environment variables only!
 */

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { STORAGE_CONFIG, type UploadResult } from "./config";

class StorageClient {
	private s3Client: S3Client | null = null;

	constructor() {
		if (STORAGE_CONFIG.provider !== "local") {
			this.initializeS3Client();
		}
	}

	private initializeS3Client() {
		interface S3ClientConfig {
			region: string;
			credentials: {
				accessKeyId: string;
				secretAccessKey: string;
			};
			endpoint?: string;
		}

		const config: S3ClientConfig = {
			region: STORAGE_CONFIG.region,
			credentials: {
				accessKeyId: STORAGE_CONFIG.accessKeyId,
				secretAccessKey: STORAGE_CONFIG.secretAccessKey,
			},
		};

		// For Cloudflare R2 or custom S3-compatible storage
		if (STORAGE_CONFIG.endpoint) {
			config.endpoint = STORAGE_CONFIG.endpoint;
		}

		this.s3Client = new S3Client(config);
	}

	/**
	 * Generate a presigned URL for client-side upload
	 * This is more efficient than uploading through the API
	 */
	async getPresignedUploadUrl(
		key: string,
		contentType: string,
		expiresIn = 3600 // 1 hour
	): Promise<string> {
		if (!this.s3Client) {
			throw new Error("Storage client not initialized");
		}

		const command = new PutObjectCommand({
			Bucket: STORAGE_CONFIG.bucket,
			Key: key,
			ContentType: contentType,
		});

		return await getSignedUrl(this.s3Client, command, { expiresIn });
	}

	/**
	 * Upload file directly (for server-side uploads)
	 */
	async uploadFile(
		key: string,
		buffer: Buffer,
		contentType: string
	): Promise<UploadResult> {
		if (STORAGE_CONFIG.provider === "local") {
			return this.uploadLocal(key, buffer, contentType);
		}

		if (!this.s3Client) {
			throw new Error("Storage client not initialized");
		}

		const command = new PutObjectCommand({
			Bucket: STORAGE_CONFIG.bucket,
			Key: key,
			Body: buffer,
			ContentType: contentType,
		});

		await this.s3Client.send(command);

		return {
			url: `${STORAGE_CONFIG.baseUrl}/${key}`,
			key,
			size: buffer.length,
			mimeType: contentType,
		};
	}

	/**
	 * Local storage fallback (for development)
	 */
	private async uploadLocal(
		key: string,
		buffer: Buffer,
		contentType: string
	): Promise<UploadResult> {
		// Save to local filesystem
		const fs = await import("node:fs/promises");
		const path = await import("node:path");

		const fullPath = path.join(
			STORAGE_CONFIG.localPath || "./public/uploads",
			key
		);
		const dir = path.dirname(fullPath);

		// Ensure directory exists
		await fs.mkdir(dir, { recursive: true });

		// Write file
		await fs.writeFile(fullPath, buffer);

		console.log(`✅ File saved locally: ${fullPath}`);

		return {
			url: `${STORAGE_CONFIG.baseUrl}/${key}`,
			key,
			size: buffer.length,
			mimeType: contentType,
		};
	}

	/**
	 * Generate a unique storage key
	 */
	generateKey(
		userId: string,
		type: "image" | "document",
		filename: string
	): string {
		const timestamp = Date.now();
		const randomStr = Math.random().toString(36).substring(2, 15);
		const ext = filename.split(".").pop();

		return `${type}s/${userId}/${timestamp}-${randomStr}.${ext}`;
	}

	/**
	 * Validate file size and type
	 */
	validateFile<T extends keyof typeof STORAGE_CONFIG.maxSizes>(
		size: number,
		mimeType: string,
		type: T
	): { valid: boolean; error?: string } {
		// Check size
		const maxSize = STORAGE_CONFIG.maxSizes[type];
		if (size > maxSize) {
			return {
				valid: false,
				error: `File too large. Maximum size is ${
					maxSize / 1024 / 1024
				}MB`,
			};
		}

		// Check type
		const allowedTypes = STORAGE_CONFIG.allowedTypes[type];
		if (!allowedTypes.includes(mimeType as never)) {
			return {
				valid: false,
				error: `File type not allowed. Allowed types: ${allowedTypes.join(
					", "
				)}`,
			};
		}

		return { valid: true };
	}
}

// Export singleton instance
export const storageClient = new StorageClient();
