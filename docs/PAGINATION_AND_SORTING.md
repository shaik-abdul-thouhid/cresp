# Pagination and Sorting Implementation

## Overview

The feed page now implements efficient pagination with a "Load More" button and supports multiple sorting options via query parameters.

## Features

### 1. **Pagination**
- **Initial Load**: Shows 20 posts on first page load (server-rendered for SEO)
- **Load More**: Button appears at the bottom if more posts are available
- **Cursor-based**: Uses cursor-based pagination for better performance
- **Smart Loading**: Only shows "Load More" button when there are actually more posts

### 2. **Sorting Options**
Three sorting modes available via URL query parameters:

- **`?sortBy=latest`** (default): Newest posts first (ordered by `createdAt DESC`)
- **`?sortBy=popular`**: Most liked posts first (ordered by `likeCount DESC`)
- **`?sortBy=discussed`**: Most commented posts first (ordered by `commentCount DESC`)

### 3. **UI Components**

#### Sort Filter Bar
- Located above the feed
- Three buttons: Latest, Popular, Discussed
- Active button is highlighted in purple
- Responsive design (horizontal scroll on mobile)

#### Load More Button
- Beautiful gradient design (purple to indigo)
- Loading spinner animation when fetching
- Automatically hidden when no more posts available
- Disabled state during loading

## Implementation Details

### Files Modified/Created

1. **`src/app/(public)/feed/page.tsx`**
   - Added `sortBy` query param support
   - Implements dynamic ordering based on sort option
   - Fetches 21 posts (20 + 1 to check if more exist)
   - Added `SortFilter` component for UI
   - Passes `hasMore` and `sortBy` to client component

2. **`src/app/(public)/feed/feed-posts-list.tsx`**
   - Now manages posts state client-side
   - Implements `handleLoadMore` function
   - Dynamically imports server action
   - Shows loading spinner during fetch
   - Appends new posts to existing list

3. **`src/server/actions/feed.ts`** (NEW)
   - Server action for loading more posts
   - Uses cursor-based pagination with `skip` and `cursor`
   - Respects the same sort order as initial load
   - Returns both posts and `hasMore` flag

### How It Works

#### Initial Page Load (Server-Side)
```typescript
// 1. Get sortBy from query params (defaults to "latest")
const sortBy = searchParams.sortBy || "latest";

// 2. Determine order
const orderBy = sortBy === "popular" ? { likeCount: "desc" } : ...

// 3. Fetch 21 posts (20 + 1 to check for more)
const posts = await db.post.findMany({
  where: { ... },
  orderBy,
  take: POSTS_PER_PAGE + 1, // 21
});

// 4. Check if more exist
const hasMore = posts.length > POSTS_PER_PAGE;
const displayPosts = hasMore ? posts.slice(0, 20) : posts;

// 5. Pass to client component
<FeedPostsList posts={displayPosts} hasMore={hasMore} sortBy={sortBy} />
```

#### Loading More Posts (Client-Side)
```typescript
// 1. User clicks "Load More"
const handleLoadMore = async () => {
  // 2. Get last post ID as cursor
  const lastPost = posts[posts.length - 1];
  
  // 3. Call server action
  const { loadMorePosts } = await import("~/server/actions/feed");
  const result = await loadMorePosts(lastPost.id, sortBy);
  
  // 4. Append new posts
  setPosts((prev) => [...prev, ...result.posts]);
  setHasMore(result.hasMore);
};
```

#### Server Action (Cursor-Based Pagination)
```typescript
const posts = await db.post.findMany({
  where: { ... },
  orderBy,
  take: POSTS_PER_PAGE + 1, // Fetch 21
  skip: 1,                   // Skip the cursor itself
  cursor: { id: cursor },    // Start from last post ID
});
```

## Usage Examples

### Basic Feed (Latest Posts)
```
/feed
```
Shows the latest 20 posts, sorted by newest first.

### Popular Posts
```
/feed?sortBy=popular
```
Shows the 20 most liked posts.

### Most Discussed Posts
```
/feed?sortBy=discussed
```
Shows the 20 most commented posts.

### Combining with Highlight
```
/feed?highlight=POST_ID&sortBy=popular
```
Shows popular posts with a specific post highlighted.

## Performance Considerations

### Cursor-Based Pagination Benefits
- **Consistent Results**: No duplicates or skipped posts even if new posts are added
- **Efficient Queries**: Database can use indexes more effectively
- **Scalable**: Performance doesn't degrade with deep pagination

### Caching Strategy
- Initial page is cached for 60 seconds (`revalidate = 60`)
- Subsequent loads via "Load More" are fresh data
- Reduces database load while keeping feed relatively fresh

## Sorting Persistence

The sorting option is maintained when loading more posts:
- Initial load uses `?sortBy=` query param
- Load More action receives the same `sortBy` value
- Ensures consistent ordering throughout pagination

## Edge Cases Handled

1. **No Posts**: Shows empty state card
2. **Exactly 20 Posts**: No "Load More" button shown
3. **Loading Error**: Gracefully catches and logs errors
4. **Concurrent Clicks**: Button disabled during loading
5. **Invalid Sort Option**: Falls back to "latest"

## Future Enhancements

Potential improvements for later:

1. **Infinite Scroll**: Auto-load when scrolling near bottom
2. **Filter by Hashtag**: Add `?hashtag=` query param
3. **Filter by User**: Add `?user=` query param
4. **Date Range**: Add `?from=` and `?to=` params
5. **Search**: Add text search functionality
6. **Virtual Scrolling**: For very long lists
7. **Optimistic Updates**: Show skeleton while loading

## Testing

To test the implementation:

1. **Pagination**:
   - Visit `/feed`
   - Scroll to bottom
   - Click "Load More"
   - Verify new posts appear
   - Continue until no more posts

2. **Sorting**:
   - Click "Latest" - should show newest posts
   - Click "Popular" - should show most liked posts
   - Click "Discussed" - should show most commented posts
   - Use "Load More" with each sort option

3. **Query Params**:
   - Manually navigate to `/feed?sortBy=popular`
   - Verify correct sorting
   - Click "Load More" - should maintain sort order

## Performance Metrics

Expected performance characteristics:

- **Initial Load**: ~100-300ms (server-side)
- **Load More**: ~200-500ms (client-side with server action)
- **Database Queries**: Indexed and optimized
- **Client Memory**: ~5KB per post × number loaded

## Maintenance Notes

### Changing Posts Per Page

To change the number of posts per page, update the constant in both files:

```typescript
// src/app/(public)/feed/page.tsx
const POSTS_PER_PAGE = 20; // Change this

// src/server/actions/feed.ts
const POSTS_PER_PAGE = 20; // And this
```

### Adding New Sort Options

1. Add to `SORT_OPTIONS` array in `page.tsx`
2. Add case to switch statement in both `page.tsx` and `feed.ts`
3. Ensure database has appropriate indexes

Example:
```typescript
case "trending":
  orderBy = [
    { likeCount: "desc" },
    { commentCount: "desc" },
    { createdAt: "desc" }
  ];
  break;
```

## Database Indexes

Recommended indexes for optimal performance:

```sql
-- For sorting by createdAt
CREATE INDEX idx_posts_created_at ON posts(created_at DESC) 
WHERE visibility = 'PUBLIC' AND deleted_at IS NULL;

-- For sorting by likeCount
CREATE INDEX idx_posts_like_count ON posts(like_count DESC) 
WHERE visibility = 'PUBLIC' AND deleted_at IS NULL;

-- For sorting by commentCount
CREATE INDEX idx_posts_comment_count ON posts(comment_count DESC) 
WHERE visibility = 'PUBLIC' AND deleted_at IS NULL;
```

## Related Files

- `src/app/(public)/feed/page.tsx` - Main feed page with sorting
- `src/app/(public)/feed/feed-posts-list.tsx` - Client component with Load More
- `src/server/actions/feed.ts` - Server action for pagination
- `prisma/schema.prisma` - Database schema

