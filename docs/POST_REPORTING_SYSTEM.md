# Post Reporting System

## Overview

A comprehensive content moderation system allowing users to report posts that violate community guidelines. The system includes copyright violation reporting as a critical feature.

## Features

### 1. **Three-Dot Menu on Posts**
- Located at the top-right corner of each post
- Clean, minimal design with hover effects
- Dropdown menu with reporting option
- Click-outside detection to close menu

### 2. **Report Modal**
Beautiful, user-friendly modal with:
- All active moderation categories from database
- Icon, name, and description for each category
- Color-coded severity indicators
- Required details for high-severity reports
- Warning about false reports
- Smooth animations and transitions

### 3. **Moderation Categories**

#### Available Report Types:
1. **🤖 AI Content Not Disclosed** (Severity: 2)
   - Low severity, optional details

2. **🔞 NSFW Content** (Severity: 4)
   - High priority, automatic removal
   - Optional details

3. **📧 Spam** (Severity: 3)
   - Medium severity, automatic warning
   - Optional details

4. **⚠️ Harassment** (Severity: 5)
   - Urgent priority, automatic ban
   - **Details required**

5. **©️ Copyright Violation** (Severity: 4) ⭐ **CRITICAL**
   - High priority, automatic removal
   - **Details required** (proof of ownership)
   - Purple color indicator
   - Users must provide evidence

6. **❌ Misinformation** (Severity: 3)
   - Medium severity
   - **Details required** (proof needed)

7. **🎭 Fake/Manipulated Content** (Severity: 5)
   - Urgent priority, automatic removal
   - **Details required**

8. **📍 Off-Topic Content** (Severity: 1)
   - Low severity
   - Optional details

9. **💬 Hate Speech** (Severity: 5)
   - Urgent priority, automatic ban
   - **Details required**

10. **📜 Terms of Service Violation** (Severity: 3)
    - Medium severity
    - **Details required**

### 4. **Report Submission Logic**

#### Weighted Reporting System
- Each report has a weight based on reporter's trust score
- Reporter's reputation is tracked
- Prevents abuse from bad actors

#### Anti-Spam Protection
- Users can only report each post once
- Duplicate report attempts are blocked

#### Moderation Queue
- Reports are aggregated by category
- Total weight and average weight calculated
- Priority automatically assigned based on severity:
  - Severity 4-5 → HIGH priority
  - Severity 3 → NORMAL priority  
  - Severity 1-2 → LOW priority

## Files Created

### Components
```
src/components/posts/report-post-modal.tsx
```
- Full-featured report modal
- Fetches categories dynamically
- Form validation
- Loading and submission states
- Toast notifications for feedback

### API Routes

```
src/app/api/posts/report-categories/route.ts
```
- GET endpoint to fetch active moderation categories
- Returns sorted by display order
- Only active categories

```
src/app/api/posts/report/route.ts
```
- POST endpoint to submit reports
- Validates user authentication
- Checks for duplicate reports
- Creates moderation queue entries
- Calculates report weights
- Updates aggregate statistics

### UI Updates
```
src/app/(public)/feed/feed-posts-list.tsx
```
- Added three-dot menu button
- Added dropdown menu
- Added report modal integration
- Click-outside detection
- State management for menu/modal

## Database Schema

### Tables Used

**moderation_categories**
- Stores configurable report types
- Includes icons, colors, severity
- Admin can manage via UI (future)

**moderation_reports**
- Individual reports from users
- One report per user per post
- Tracks reporter's reputation
- Includes report weight

**moderation_queue**
- Aggregated queue items
- One entry per post per category
- Tracks total reports and weights
- Assigned to moderators

## Usage Flow

### User Reports a Post

1. **User clicks three-dot menu** on post
2. **Selects "Report Post"**
3. **Modal opens** with all report categories
4. **User selects a reason**
   - If requires proof (copyright, harassment, etc.) → details field is required
   - Otherwise, details are optional
5. **User submits report**
6. **System validates**:
   - User is authenticated
   - Post exists
   - No duplicate report
   - Category is valid
7. **Report is created**:
   - Adds to moderation_reports table
   - Creates/updates moderation_queue entry
   - Calculates weighted scores
   - Assigns priority
8. **User sees success message**
9. **Modal closes**

### Moderator Reviews (Future)

1. Moderator views queue (sorted by priority/weight)
2. Reviews post and reports
3. Takes action:
   - Dismiss (invalid report)
   - Warn user
   - Remove content
   - Ban user
4. Queue item marked as resolved

## Copyright Protection ⭐

The system includes robust copyright violation reporting:

- **Icon**: ©️
- **Color**: Purple (#8b5cf6)
- **Severity**: 4 (High Priority)
- **Auto Action**: Remove content
- **Requires Proof**: YES

When reporting copyright:
1. User must select "Copyright Violation" category
2. Details field becomes **required**
3. User should provide:
   - Proof of ownership
   - Original source
   - Description of infringement
4. Report is marked HIGH priority
5. Content is automatically hidden pending review

## Image Loading Issue - RESOLVED ✅

### Problem
Images were not displaying due to Next.js image hostname configuration.

### Solution
Added localhost to `next.config.js`:

```javascript
images: {
  remotePatterns: [
    {
      protocol: "http",
      hostname: "localhost",
    },
    // ... other patterns
  ],
}
```

### Image URLs
- Development: `http://localhost:3000/api/uploads/images/...`
- Served via: `src/app/api/uploads/[...path]/route.ts`
- Storage: `public/uploads/` directory

Images should now load correctly in the feed!

## Security Features

1. **Authentication Required**
   - Only logged-in users can report
   - Reporter's ID tracked

2. **Duplicate Prevention**
   - One report per user per post
   - Unique constraint in database

3. **Trust Score System**
   - Weighted reporting based on user reputation
   - Prevents spam from new/bad accounts

4. **Rate Limiting** (Recommended Future Addition)
   - Limit reports per user per day
   - Prevent report bombing

## UI/UX Features

### Accessibility
- ARIA labels on buttons
- Keyboard navigation support
- Clear focus states
- Screen reader friendly

### Visual Feedback
- Loading spinners
- Success/error toasts
- Disabled states during submission
- Color-coded severity levels
- Warning indicators for required fields

### Responsive Design
- Modal adapts to screen size
- Scrollable content area
- Touch-friendly on mobile
- Click/tap outside to close

## Testing Checklist

- [x] Three-dot menu appears on posts
- [x] Menu opens on click
- [x] Menu closes when clicking outside
- [x] Report modal opens when clicking "Report Post"
- [x] Categories load from database
- [x] Copyright category is present with ©️ icon
- [x] Required details for high-severity reports
- [x] Form validation works
- [x] Duplicate report prevention
- [x] Success toast shows after submission
- [x] Modal closes after successful submission
- [x] Error handling for API failures
- [x] Images display correctly in feed

## Future Enhancements

1. **Moderator Dashboard**
   - View all reports in queue
   - Filter by priority/category/status
   - Bulk actions
   - Statistics and analytics

2. **Appeal System**
   - Users can appeal removed content
   - Secondary review process

3. **Automated Detection**
   - AI-based content screening
   - Automatic flagging of suspicious content
   - Integration with external APIs (copyright detection)

4. **User Notifications**
   - Email when content is removed
   - Notification when report is resolved
   - Warning messages for violations

5. **Report History**
   - Users can view their report history
   - Track resolution status
   - View outcomes

6. **Admin Configuration**
   - Manage categories via UI
   - Adjust severity levels
   - Enable/disable categories
   - Custom icons and colors

## Deployment Notes

### Environment Variables
No additional environment variables needed. The system uses:
- Existing database connection
- Existing auth system
- Local storage for images (already configured)

### Database Migration
Ensure migrations are run:
```bash
npx prisma migrate deploy
```

### Seed Data
Ensure moderation categories are seeded:
```bash
psql $DATABASE_URL -f prisma/seed.sql
```

Or verify in database:
```sql
SELECT * FROM moderation_categories WHERE is_active = true;
```

Should return 10 active categories including copyright.

## API Endpoints

### GET /api/posts/report-categories
Fetch all active moderation categories

**Response:**
```json
[
  {
    "key": "copyright",
    "name": "Copyright Violation",
    "description": "Content uses copyrighted material without permission",
    "icon": "©️",
    "color": "#8b5cf6",
    "severity": 4,
    "requiresProof": true
  },
  // ... more categories
]
```

### POST /api/posts/report
Submit a post report

**Request:**
```json
{
  "postId": "post_123",
  "categoryKey": "copyright",
  "details": "This image is my original work. Proof: ..."
}
```

**Response (Success):**
```json
{
  "message": "Report submitted successfully"
}
```

**Response (Error):**
```json
{
  "error": "You have already reported this post"
}
```

## Related Documentation
- [PAGINATION_AND_SORTING.md](./PAGINATION_AND_SORTING.md) - Feed pagination
- [STORAGE_MIGRATION.md](./STORAGE_MIGRATION.md) - File storage system
- [schema.prisma](../prisma/schema.prisma) - Database schema
- [seed.sql](../prisma/seed.sql) - Seed data including categories

