# Video Hosting Options for Cresp

## Current Implementation (MVP)

✅ **External Video Links** - Users paste links from:
- YouTube
- Vimeo  
- Dailymotion

**Benefits:**
- ✅ Zero hosting costs
- ✅ No bandwidth concerns
- ✅ Professional video player UI
- ✅ Users already familiar with these platforms
- ✅ Built-in CDN and streaming optimization
- ✅ Works on free tier Vercel

**Implementation:**
- Schema supports `VIDEO_LINK` type
- Store: `videoProvider`, `videoId`, `thumbnailUrl`
- Embed using iframe on frontend
- Parse URL to extract provider + ID

---

## Future Scaling Options (When You Have Budget/Users)

### 🥇 **Option 1: Cloudflare Stream (Recommended)**

**Pricing:**
- $1 per 1,000 minutes stored
- $1 per 1,000 minutes delivered
- Free up to 1,000 minutes stored + delivered per month

**Why Best:**
- ✅ Great free tier (perfect for early users)
- ✅ Works seamlessly with Cloudflare CDN
- ✅ Auto-generates thumbnails
- ✅ Adaptive bitrate streaming (HLS)
- ✅ Simple API
- ✅ Built-in video player
- ✅ Automatic encoding to multiple resolutions

**When to use:** When you have 100+ active users posting videos regularly

**Code Example:**
```typescript
// Upload to Cloudflare Stream
const formData = new FormData();
formData.append('file', videoFile);

const response = await fetch(
  'https://api.cloudflare.com/client/v4/accounts/{account_id}/stream',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
    },
    body: formData,
  }
);

const { uid, thumbnail } = await response.json();
// Save: videoProvider='cloudflare', videoId=uid, thumbnailUrl=thumbnail
```

---

### 🥈 **Option 2: Bunny.net Stream**

**Pricing:**
- $10/month for 1TB storage + 1TB bandwidth
- Then $0.01/GB storage + $0.005/GB bandwidth

**Why Good:**
- ✅ Very cheap for high volume
- ✅ Fast European CDN
- ✅ Good documentation
- ✅ Direct upload API

**When to use:** When you have 1,000+ users and predictable traffic

---

### 🥉 **Option 3: AWS S3 + CloudFront**

**Pricing:**
- S3: $0.023/GB storage
- CloudFront: $0.085/GB transfer (first 10TB)

**Why Consider:**
- ✅ Industry standard
- ✅ Unlimited scalability
- ✅ Integrate with AWS ecosystem
- ❌ More complex setup
- ❌ Higher costs

**When to use:** When you're processing 10,000+ videos/month

---

### 🎯 **Option 4: Mux**

**Pricing:**
- $0.005 per minute encoded
- $0.01 per GB delivered
- Free tier: First $5/month free

**Why Interesting:**
- ✅ Built for developers
- ✅ Excellent analytics
- ✅ Auto-generates GIFs
- ✅ Built-in video player
- ✅ Webhooks for processing status

**When to use:** When you want video analytics and insights

---

### 🆓 **Option 5: Keep External Links + Add Cloudflare R2 (Hybrid)**

**Pricing:**
- R2: $0.015/GB storage
- **Zero egress fees** (unlike S3)
- Free tier: 10GB storage/month

**Strategy:**
1. Let most users use YouTube/Vimeo (free)
2. Offer "premium" users direct uploads to R2
3. Serve via Cloudflare CDN (Workers)

**Benefits:**
- ✅ Most cost-effective hybrid
- ✅ No egress charges
- ✅ S3-compatible API
- ✅ Cloudflare edge network

**Code Example:**
```typescript
// Upload to R2 (S3-compatible)
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

await r2.send(new PutObjectCommand({
  Bucket: 'cresp-videos',
  Key: videoId,
  Body: videoFile,
  ContentType: 'video/mp4',
}));
```

---

## Recommendation Path

### **Phase 1 (MVP - Now):**
✅ External video links only (YouTube/Vimeo)
- Cost: $0
- Effort: 1 hour (already done)

### **Phase 2 (100-500 users):**
Add Cloudflare Stream with free tier
- Cost: $0-$20/month
- Effort: 4-6 hours
- Features: Direct upload, auto-thumbnails

### **Phase 3 (500-5000 users):**
Switch to Bunny.net or Cloudflare R2
- Cost: $10-$50/month
- Effort: 8-12 hours
- Features: Full control, lower costs

### **Phase 4 (5000+ users):**
Evaluate AWS S3 + CloudFront or Mux
- Cost: $100-$500/month
- Effort: 2-3 days
- Features: Unlimited scale, analytics

---

## Technical Implementation Notes

### **Video Embedding (Frontend)**

```tsx
// components/video-player.tsx
export function VideoPlayer({ provider, videoId }: VideoPlayerProps) {
  if (provider === 'youtube') {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        className="aspect-video w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media"
      />
    );
  }
  
  if (provider === 'vimeo') {
    return (
      <iframe
        src={`https://player.vimeo.com/video/${videoId}`}
        className="aspect-video w-full"
        allow="autoplay; fullscreen; picture-in-picture"
      />
    );
  }
  
  if (provider === 'cloudflare') {
    return (
      <iframe
        src={`https://customer-${CLOUDFLARE_CUSTOMER_CODE}.cloudflarestream.com/${videoId}/iframe`}
        className="aspect-video w-full"
        allow="accelerometer; autoplay; encrypted-media; gyroscope"
      />
    );
  }
  
  // Fallback
  return <video src={videoUrl} controls className="w-full" />;
}
```

### **Database Schema (Already Supports This!)**

```prisma
model PostMedia {
  mediaType     MediaType  // VIDEO_LINK or VIDEO_HOSTED
  url           String     // Original URL or CDN URL
  videoProvider String?    // 'youtube', 'vimeo', 'cloudflare', etc.
  videoId       String?    // Platform-specific ID
  thumbnailUrl  String?    // Auto-generated thumbnail
}
```

---

## Cost Comparison (1000 videos, 100GB each)

| Provider | Storage | Bandwidth (10TB/mo) | Total/Month |
|----------|---------|---------------------|-------------|
| YouTube/Vimeo | $0 | $0 | **$0** |
| Cloudflare R2 | $1.50 | $0 | **$1.50** |
| Cloudflare Stream | $1.00 | $10 | **$11** |
| Bunny.net | $10 (flat) | Included | **$10** |
| AWS S3 + CloudFront | $23 | $850 | **$873** |

---

## Final Recommendation

**For MVP (Now):** 
✅ Stick with external links (YouTube/Vimeo/Dailymotion)

**When Ready to Scale:**
1. Add Cloudflare Stream for premium users
2. Keep external links for everyone else
3. This gives you flexibility without breaking the bank

**Why This Works:**
- Most users already upload to YouTube/Vimeo anyway
- No infrastructure to maintain
- When you get funding, easy to add direct uploads
- Schema already supports both approaches

---

## Implementation Checklist

- [x] Support YouTube links
- [x] Support Vimeo links
- [x] Support Dailymotion links
- [ ] Add video player component (displays embeds)
- [ ] Add thumbnail extraction for links
- [ ] Add Cloudflare Stream integration (future)
- [ ] Add video processing webhooks (future)
- [ ] Add video analytics (future)

---

**Last Updated:** October 26, 2024  
**Status:** MVP phase - External links only ✅

