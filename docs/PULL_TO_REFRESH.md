# Pull-to-Refresh Feature

## Overview

Native mobile pull-to-refresh functionality that allows users to refresh the feed by pulling down on the screen. This provides a familiar mobile UX pattern that users expect in modern mobile apps.

## Features

✅ **Touch-based interaction** - Pull down from the top to refresh  
✅ **Visual feedback** - Animated indicator shows pull progress  
✅ **Threshold-based** - Must pull past threshold to trigger refresh  
✅ **Smooth animations** - Icon rotates based on pull distance  
✅ **Loading state** - Spinning animation while refreshing  
✅ **Resistance effect** - Natural feel with pull resistance  
✅ **Auto-reset** - Returns to normal after refresh completes  
✅ **Desktop-safe** - Only active on touch devices  

## Implementation

### Files Created

**Hook:**
- `src/hooks/use-pull-to-refresh.tsx` - Core pull-to-refresh logic

**Component:**
- `src/components/pull-to-refresh-wrapper.tsx` - Visual indicator wrapper

**Integration:**
- `src/app/(public)/feed/page.tsx` - Wrapped feed content

### How It Works

#### 1. Touch Detection
```typescript
// Detects when user touches screen at top of page
handleTouchStart(e: TouchEvent) {
  const scrollTop = window.scrollY;
  if (scrollTop === 0) {
    // Start tracking pull
  }
}
```

#### 2. Pull Distance Tracking
```typescript
// Calculates pull distance with resistance
const distance = currentY - startY;
const resistance = Math.min(distance / 2.5, maxPullDistance);
```

#### 3. Threshold Check
```typescript
// Triggers refresh if pulled past threshold (80px default)
if (pullDistance >= threshold) {
  await onRefresh();
}
```

#### 4. Visual Feedback
- **Icon rotation**: `0-360°` based on pull distance
- **Opacity fade**: Fades in as you pull
- **Position**: Moves down with your finger
- **Messages**: 
  - "Pull to refresh" (initial)
  - "Release to refresh" (past threshold)
  - "Refreshing..." (active)

## Usage

### Basic Implementation

```tsx
import { PullToRefreshWrapper } from "~/components/pull-to-refresh-wrapper";

export default function Page() {
  return (
    <PullToRefreshWrapper>
      {/* Your content here */}
    </PullToRefreshWrapper>
  );
}
```

### Custom Hook Usage

```tsx
import { usePullToRefresh } from "~/hooks/use-pull-to-refresh";

function MyComponent() {
  const { containerRef, isPulling, isRefreshing, pullDistance } = 
    usePullToRefresh({
      onRefresh: async () => {
        // Your refresh logic
        await fetchNewData();
      },
      threshold: 80,        // Pixels to pull before refresh
      maxPullDistance: 120, // Max pull distance
    });

  return (
    <div ref={containerRef}>
      {/* Your content */}
    </div>
  );
}
```

## Configuration

### Options

```typescript
interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;  // Refresh function
  threshold?: number;                // Default: 80px
  maxPullDistance?: number;          // Default: 120px
}
```

### Customization

**Threshold** - How far to pull before refreshing:
```typescript
threshold: 80  // Default - balanced
threshold: 60  // More sensitive
threshold: 100 // Less sensitive
```

**Max Pull Distance** - Maximum pull distance:
```typescript
maxPullDistance: 120 // Default
maxPullDistance: 150 // Allow longer pulls
```

**Resistance** - Adjust the resistance calculation:
```typescript
// In use-pull-to-refresh.tsx
const resistance = Math.min(distance / 2.5, maxPullDistance);
// Increase divisor (e.g., 3.0) for more resistance
// Decrease divisor (e.g., 2.0) for less resistance
```

## User Experience

### Mobile Behavior

1. **User pulls down** from top of feed
2. **Indicator appears** showing pull progress
3. **Icon rotates** 360° as they pull
4. **Message updates** based on distance
5. **At threshold**, "Release to refresh" shows
6. **User releases**, refresh starts
7. **Spinner shows** while loading
8. **Content updates**, indicator disappears

### Desktop Behavior

- Pull-to-refresh is **inactive** on desktop
- Users can use browser refresh or manual refresh
- Touch events only trigger on touch-capable devices

## Performance

### Optimizations

1. **Passive event listeners** - Where possible for better scroll performance
2. **Conditional activation** - Only when at top of page
3. **Request animation frame** - Smooth animations
4. **Cleanup** - Proper event listener removal
5. **Minimal re-renders** - State updates only when necessary

### Refresh Strategy

```typescript
onRefresh: async () => {
  // 1. Refresh route data
  router.refresh();
  
  // 2. Small delay for UX
  await new Promise(resolve => setTimeout(resolve, 500));
}
```

This uses Next.js's `router.refresh()` which:
- Refetches data from the server
- Re-renders server components
- Maintains client state
- Updates the page without full reload

## Styling

### Indicator Component

```tsx
<div className="fixed left-0 right-0 top-0 z-50">
  <div className="rounded-full bg-white px-4 py-2 shadow-lg">
    <RefreshCw className="h-5 w-5 text-purple-600" />
    <span>Pull to refresh</span>
  </div>
</div>
```

**Customizable styles:**
- Background color: `bg-white`
- Shadow: `shadow-lg`
- Icon color: `text-purple-600`
- Position: `fixed top-0`
- Z-index: `z-50`

### Animation Classes

```tsx
// Spin during refresh
className={isRefreshing ? "animate-spin" : ""}

// Rotate based on pull
style={{ transform: `rotate(${rotation}deg)` }}

// Fade in/out
style={{ opacity }}
```

## Accessibility

### Considerations

1. **Visual feedback** - Clear indicators
2. **Text labels** - Descriptive messages
3. **Icon rotation** - Shows progress visually
4. **Smooth animations** - Not jarring
5. **Optional** - Doesn't prevent other refresh methods

### Alternative Methods

Users can still refresh via:
- Browser refresh button
- Keyboard shortcuts (Ctrl+R / Cmd+R)
- Navigation refresh
- Manual page reload

## Browser Support

### Compatible With

✅ Modern mobile browsers (iOS Safari, Chrome, Firefox)  
✅ Android browsers (Chrome, Samsung Internet)  
✅ Progressive Web Apps (PWA)  
✅ Touch-enabled devices  

### Not Affecting

❌ Desktop browsers (events don't trigger)  
❌ Mouse-only interactions  
❌ Keyboard navigation  

## Testing

### Manual Testing

1. **Pull gently** - Should show indicator
2. **Pull past threshold** - Should say "Release"
3. **Release** - Should start refreshing
4. **Pull and cancel** - Should reset smoothly
5. **Multiple pulls** - Should work repeatedly
6. **While scrolled** - Should not activate

### Test Cases

```typescript
// 1. At top of page
window.scrollY === 0 // ✅ Should activate

// 2. Scrolled down
window.scrollY > 0 // ❌ Should not activate

// 3. Past threshold
pullDistance >= 80 // ✅ Should refresh

// 4. Below threshold
pullDistance < 80 // ❌ Should cancel

// 5. During refresh
isRefreshing === true // ❌ Should not allow new pull
```

## Troubleshooting

### Common Issues

**Issue**: Pull-to-refresh not activating
- **Fix**: Ensure you're at the top of the page (`scrollY === 0`)
- **Fix**: Check touch events are supported

**Issue**: Indicator not showing
- **Fix**: Check z-index (`z-50`)
- **Fix**: Verify `isPulling` state

**Issue**: Refresh not triggering
- **Fix**: Check threshold value (default 80px)
- **Fix**: Verify `onRefresh` function

**Issue**: Janky animations
- **Fix**: Reduce re-renders
- **Fix**: Use CSS transforms (hardware accelerated)

**Issue**: Interfering with scroll
- **Fix**: `preventDefault()` only when pulling down
- **Fix**: Check `passive: false` on touchmove

## Future Enhancements

Potential improvements:

1. **Haptic feedback** - Vibration on refresh trigger
2. **Custom animations** - More pull-to-refresh styles
3. **Sound effects** - Optional audio feedback
4. **Loading progress** - Show actual progress %
5. **Pull-to-load-more** - At bottom of page
6. **Horizontal refresh** - Swipe gestures
7. **Custom indicators** - Different visual styles
8. **Analytics** - Track refresh usage

## Related Features

- **Lazy Loading** - Images load as you scroll
- **Pagination** - Load more button
- **Infinite Scroll** - Auto-load on scroll
- **Cache Revalidation** - Server data freshness

## Performance Metrics

Expected behavior:
- **Pull detection**: <16ms (60fps)
- **Animation**: 60fps smooth
- **Refresh time**: ~500-1000ms
- **Memory**: Minimal overhead
- **Event cleanup**: Proper disposal

## Best Practices

1. ✅ **Only at top** - Don't activate when scrolled
2. ✅ **Clear feedback** - Show what's happening
3. ✅ **Quick refresh** - Under 1 second ideal
4. ✅ **Smooth reset** - Animate back to normal
5. ✅ **Prevent spam** - Disable during refresh
6. ✅ **Mobile-first** - Touch devices only
7. ✅ **Accessible** - Multiple refresh methods

## Examples

### Feed Page Implementation

```tsx
// src/app/(public)/feed/page.tsx
return (
  <PullToRefreshWrapper>
    <div className="lg:grid lg:gap-6 lg:grid-cols-12">
      <main>
        <FeedPostsList posts={posts} />
      </main>
    </div>
  </PullToRefreshWrapper>
);
```

### Custom Refresh Logic

```tsx
const { containerRef, isPulling } = usePullToRefresh({
  onRefresh: async () => {
    // Custom refresh logic
    await mutate('/api/posts');
    await refetchData();
    showToast('Feed refreshed!');
  },
});
```

## Resources

- Touch Events API: [MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- Next.js Router: [router.refresh()](https://nextjs.org/docs/app/api-reference/functions/use-router#routerrefresh)
- React Hooks: [useEffect](https://react.dev/reference/react/useEffect)

## Changelog

**v1.0.0** - Initial implementation
- Basic pull-to-refresh functionality
- Visual indicator with rotation
- Feed page integration
- Touch event handling
- Smooth animations

