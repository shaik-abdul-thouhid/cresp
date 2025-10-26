/**
 * Storage Configuration
 *
 * This abstraction allows easy switching between storage providers
 * (S3, Cloudflare R2, Backblaze B2, etc.) with minimal code changes.
 *
 * To switch providers:
 * 1. Update STORAGE_PROVIDER in .env
 * 2. Update credentials in .env
 * 3. No code changes needed!
 */

export const STORAGE_CONFIG = {
	// Storage provider: 's3' | 'r2' | 'b2' | 'local'
	provider: (process.env.STORAGE_PROVIDER ?? "local") as StorageProvider,

	// Base URL for accessing files
	// For local: use relative path (works on any domain)
	// For cloud: use full CDN URL
	baseUrl: process.env.STORAGE_BASE_URL ?? "/api/uploads",

	// Local storage path (for development)
	localPath: process.env.STORAGE_LOCAL_PATH ?? "./public/uploads",

	// Bucket/Container name
	bucket: process.env.STORAGE_BUCKET ?? "cresp-media",

	// Region (for S3/R2)
	region: process.env.STORAGE_REGION ?? "auto",

	// Credentials
	accessKeyId: process.env.STORAGE_ACCESS_KEY_ID ?? "",
	secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY ?? "",

	// Endpoint (for R2/B2/custom S3)
	endpoint: process.env.STORAGE_ENDPOINT,

	// Max file sizes (in bytes)
	maxSizes: {
		image: 5 * 1024 * 1024, // 5MB
		document: 10 * 1024 * 1024, // 10MB
		// Audio/video are links only, no upload limits
	},

	// Allowed MIME types
	allowedTypes: {
		image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
		document: [
			"application/pdf",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			"text/plain",
		],
	},
} as const;

export type StorageProvider = "s3" | "r2" | "b2" | "local";

export interface UploadResult {
	url: string; // Full URL to access the file
	key: string; // Storage key/path
	size: number;
	mimeType: string;
}
