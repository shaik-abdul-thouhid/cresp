# Storage Module

## Development (Local Storage)

For local development, the app stores files in `./public/uploads`. **No additional packages required.**

## Production (Cloud Storage)

When you're ready to deploy, install AWS SDK:

```bash
bun add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

Then update your `.env`:

```env
STORAGE_PROVIDER=r2  # or s3, b2
STORAGE_BASE_URL=https://your-bucket.r2.dev
STORAGE_BUCKET=your-bucket-name
STORAGE_ACCESS_KEY_ID=your-key-id
STORAGE_SECRET_ACCESS_KEY=your-secret-key
STORAGE_ENDPOINT=https://account-id.r2.cloudflarestorage.com
```

See `docs/STORAGE_MIGRATION.md` for complete migration guide.

