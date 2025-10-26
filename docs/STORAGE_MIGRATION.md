# Storage Migration Guide

This guide explains how to migrate between different storage providers with **zero database changes**.

## Architecture Overview

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Browser   │─────▶│  Upload API  │─────▶│   Storage   │
│             │      │  (presigned) │      │  (R2/S3/B2) │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   Database   │
                     │  (URLs only) │
                     └──────────────┘
```

### Key Principle: **URL-Based Architecture**

The database ONLY stores public URLs, never storage keys or provider-specific paths. This makes switching providers trivial!

```sql
-- Database stores URLs (provider-agnostic)
posts_media:
  url: "https://cdn.example.com/images/user123/abc.jpg"  ✅
  url: "s3://bucket/key"  ❌ NEVER
```

---

## Current Setup: Local Storage (Development)

### `.env` Configuration

```env
# Local storage for development
STORAGE_PROVIDER=local
STORAGE_BASE_URL=/api/uploads  # Relative path - works on any domain!
STORAGE_LOCAL_PATH=./public/uploads
```

**Note:** Using a relative path (`/api/uploads`) instead of absolute URL means it works on:
- ✅ localhost:3000
- ✅ 192.168.x.x:3000 (local network)
- ✅ Any domain (staging, preview, production)

### How It Works

1. User uploads file → Goes to `/api/media/upload-local`
2. File saved to `./public/uploads/images/user123/timestamp-random.jpg`
3. URL stored in DB: `http://localhost:3000/api/uploads/images/user123/timestamp-random.jpg`
4. API route `/api/uploads/[...path]` serves the file

---

## Migration Option 1: Cloudflare R2 (Recommended)

**Why R2?**
- ✅ $0.015/GB storage
- ✅ **Zero egress fees** (vs $90/TB on S3!)
- ✅ S3-compatible API
- ✅ Generous free tier (10GB storage, 1M requests/month)

### Step 1: Create R2 Bucket

1. Go to Cloudflare Dashboard → R2
2. Create bucket: `cresp-media`
3. Enable public access domain: `cresp-media.YOUR-ACCOUNT.r2.dev`
4. Create API token with R2 permissions

### Step 2: Update `.env`

```env
# Cloudflare R2
STORAGE_PROVIDER=r2
STORAGE_BASE_URL=https://cresp-media.YOUR-ACCOUNT.r2.dev
STORAGE_BUCKET=cresp-media
STORAGE_REGION=auto
STORAGE_ACCESS_KEY_ID=<your-r2-access-key-id>
STORAGE_SECRET_ACCESS_KEY=<your-r2-secret-key>
STORAGE_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
```

### Step 3: Deploy

**That's it!** New uploads go to R2. No code changes needed!

### Step 4: Migrate Old Files (Optional)

```bash
# Copy local files to R2 using rclone or aws cli
aws s3 sync ./public/uploads s3://cresp-media \
  --endpoint-url https://<account-id>.r2.cloudflarestorage.com

# Update old URLs in database
UPDATE posts_media 
SET url = REPLACE(url, 
  'http://localhost:3000/api/uploads', 
  'https://cresp-media.YOUR-ACCOUNT.r2.dev'
);
```

---

## Migration Option 2: AWS S3

### Step 1: Create S3 Bucket

1. Go to AWS Console → S3
2. Create bucket: `cresp-media`
3. Enable public access (or use CloudFront)
4. Create IAM user with S3 permissions

### Step 2: Update `.env`

```env
# AWS S3
STORAGE_PROVIDER=s3
STORAGE_BASE_URL=https://cresp-media.s3.amazonaws.com
# Or with CloudFront: https://d1234567890abc.cloudfront.net
STORAGE_BUCKET=cresp-media
STORAGE_REGION=us-east-1
STORAGE_ACCESS_KEY_ID=<your-aws-access-key>
STORAGE_SECRET_ACCESS_KEY=<your-aws-secret-key>
# No STORAGE_ENDPOINT needed for AWS S3
```

### Step 3: Deploy & Migrate (same as R2)

---

## Migration Option 3: Backblaze B2

### Step 1: Create B2 Bucket

1. Go to Backblaze → Buckets
2. Create bucket: `cresp-media`
3. Set bucket to public
4. Create application key

### Step 2: Update `.env`

```env
# Backblaze B2
STORAGE_PROVIDER=b2
STORAGE_BASE_URL=https://f003.backblazeb2.com/file/cresp-media
STORAGE_BUCKET=cresp-media
STORAGE_REGION=us-west-002
STORAGE_ACCESS_KEY_ID=<your-b2-key-id>
STORAGE_SECRET_ACCESS_KEY=<your-b2-application-key>
STORAGE_ENDPOINT=https://s3.us-west-002.backblazeb2.com
```

### Step 3: Deploy & Migrate

---

## Migration Comparison

| Provider | Storage | Egress | Free Tier | Best For |
|----------|---------|--------|-----------|----------|
| **Local** | Free | N/A | ∞ | Development only |
| **Cloudflare R2** | $0.015/GB | **$0** | 10GB/1M req | **Production (Recommended)** |
| **AWS S3** | $0.023/GB | $0.09/GB | 5GB/1yr | Enterprise with AWS |
| **Backblaze B2** | $0.005/GB | $0.01/GB | 10GB | Budget hosting |

---

## Zero-Downtime Migration Strategy

### Scenario: Local → R2 with existing posts

**Problem:** Old posts have `localhost` URLs

**Solution: Dual-mode URL resolver**

```typescript
// Add to src/lib/storage/utils.ts
export function resolveMediaUrl(url: string): string {
  // If it's a localhost URL, proxy it
  if (url.includes('localhost')) {
    return url; // Served by /api/uploads
  }
  
  // Otherwise, it's a CDN URL
  return url;
}
```

**Migration Plan:**

1. Deploy with R2 config → **New uploads go to R2**
2. Old localhost URLs still work via `/api/uploads`
3. Background job migrates files gradually
4. Update database URLs once migrated
5. Remove `/api/uploads` route

---

## Database Schema (Storage-Agnostic)

```prisma
model PostMedia {
  url          String  // Full URL - works with any storage
  fileName     String  // Original filename
  fileSize     Int     // Size in bytes
  mimeType     String  // image/jpeg, application/pdf, etc.
  
  // NO storage-specific fields!
  // ❌ storageKey
  // ❌ bucketName
  // ❌ provider
}
```

**Why this works:**

- URLs are universal
- No coupling to storage provider
- Can use different providers for different files
- Easy to migrate with SQL UPDATE

---

## Advanced: Multi-Provider Strategy

You can even use different providers for different media types!

```typescript
// src/lib/storage/config.ts
export function getStorageConfig(mediaType: 'image' | 'document') {
  if (mediaType === 'image') {
    // Images on R2 (cheap, fast)
    return R2_CONFIG;
  } else {
    // Documents on B2 (cheaper storage)
    return B2_CONFIG;
  }
}
```

Database doesn't care - it only sees URLs! 🎉

---

## Troubleshooting

### Q: What if I want to change CDN URLs later?

**A:** Simple SQL UPDATE:

```sql
UPDATE posts_media 
SET url = REPLACE(url, 'old-domain.com', 'new-domain.com');
```

### Q: Can I use Vercel Blob?

**A:** Yes! Just update the upload logic:

```typescript
// src/lib/storage/client.ts - add Vercel Blob support
import { put } from '@vercel/blob';

async uploadFile(key, buffer, contentType) {
  const blob = await put(key, buffer, {
    access: 'public',
    contentType,
  });
  
  return {
    url: blob.url,  // Still just a URL!
    key,
    size: buffer.length,
    mimeType: contentType,
  };
}
```

### Q: How to add CDN (CloudFlare/CloudFront)?

**A:** Just update `STORAGE_BASE_URL`:

```env
# Before
STORAGE_BASE_URL=https://cresp-media.r2.dev

# After (with CloudFlare CDN)
STORAGE_BASE_URL=https://cdn.yoursite.com

# Database URLs automatically use new CDN!
```

---

## Summary

### ✅ Zero Database Changes Required

- Database stores URLs only
- URLs work with any storage provider
- No schema migrations needed

### ✅ Switch Providers in Minutes

1. Update `.env`
2. Deploy
3. New uploads use new provider
4. Old uploads still work (optional migration)

### ✅ Cost Optimization

- Start with local (dev)
- Move to R2 (production)
- Migrate to S3 (if needed)
- All without touching the database!

---

**The key insight:** By storing full URLs instead of storage keys, your application becomes **storage-agnostic**. This is a fundamental architectural decision that pays dividends forever.
