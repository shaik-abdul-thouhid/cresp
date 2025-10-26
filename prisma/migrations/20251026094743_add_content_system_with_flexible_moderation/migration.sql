-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'FROZEN_AI_VIOLATIONS', 'FROZEN_SPAM', 'UNDER_REVIEW', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('CASUAL', 'PORTFOLIO');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'UNDER_REVIEW', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PostVisibility" AS ENUM ('PUBLIC', 'CONNECTIONS_ONLY', 'PRIVATE');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO_LINK', 'VIDEO_HOSTED', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'RESOLVED_VALID', 'RESOLVED_INVALID', 'RESOLVED_WARNING_SENT', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ModerationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "VisibilityLevel" AS ENUM ('EVERYONE', 'CONNECTIONS', 'NOBODY');

-- CreateEnum
CREATE TYPE "AchievementCategory" AS ENUM ('MANUAL', 'POST_COUNT', 'LIKES', 'ENGAGEMENT', 'STREAK');

-- AlterTable
ALTER TABLE "user_professional_roles" ADD COLUMN     "portfolio_post_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reputation_points" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "account_frozen_until" TIMESTAMP(3),
ADD COLUMN     "account_status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "casual_post_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "portfolio_post_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_reputation" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "trust_score" DOUBLE PRECISION NOT NULL DEFAULT 1.0;

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT,
    "post_type" "PostType" NOT NULL DEFAULT 'CASUAL',
    "status" "PostStatus" NOT NULL DEFAULT 'PUBLISHED',
    "visibility" "PostVisibility" NOT NULL DEFAULT 'PUBLIC',
    "is_ai_generated" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "share_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_media" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "media_type" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "video_provider" TEXT,
    "video_id" TEXT,
    "thumbnail_url" TEXT,
    "file_name" TEXT,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "duration" INTEGER,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_professional_roles" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "professional_role_id" TEXT NOT NULL,
    "reputation_earned" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_professional_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hashtags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "use_count" INTEGER NOT NULL DEFAULT 0,
    "last_used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "is_trending" BOOLEAN NOT NULL DEFAULT false,
    "suggested_as" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hashtags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_hashtags" (
    "post_id" TEXT NOT NULL,
    "hashtag_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_hashtags_pkey" PRIMARY KEY ("post_id","hashtag_id")
);

-- CreateTable
CREATE TABLE "post_likes" (
    "user_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_likes_pkey" PRIMARY KEY ("user_id","post_id")
);

-- CreateTable
CREATE TABLE "post_comments" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mentioned_users" TEXT[],
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "post_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment_likes" (
    "user_id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comment_likes_pkey" PRIMARY KEY ("user_id","comment_id")
);

-- CreateTable
CREATE TABLE "moderation_categories" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "severity" INTEGER NOT NULL DEFAULT 1,
    "auto_action" TEXT,
    "requires_proof" BOOLEAN NOT NULL DEFAULT false,
    "icon" TEXT,
    "color" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "moderation_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_reports" (
    "id" TEXT NOT NULL,
    "queue_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "reported_by" TEXT NOT NULL,
    "category_key" TEXT NOT NULL,
    "details" TEXT,
    "report_weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "reporter_reputation" INTEGER NOT NULL,
    "reporter_trust_score" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_queue" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category_key" TEXT NOT NULL,
    "report_count" INTEGER NOT NULL DEFAULT 1,
    "total_weight" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "average_weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "status" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "ModerationPriority" NOT NULL DEFAULT 'NORMAL',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "decision" TEXT,
    "action_taken" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "moderation_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_post_rate_limits" (
    "user_id" TEXT NOT NULL,
    "posts_last_24h" INTEGER NOT NULL DEFAULT 0,
    "posts_last_hour" INTEGER NOT NULL DEFAULT 0,
    "last_post_at" TIMESTAMP(3),
    "hourly_reset_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "daily_reset_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "violation_count" INTEGER NOT NULL DEFAULT 0,
    "last_violation_at" TIMESTAMP(3),

    CONSTRAINT "user_post_rate_limits_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "post_privacy" (
    "post_id" TEXT NOT NULL,
    "can_comment" "VisibilityLevel" NOT NULL DEFAULT 'EVERYONE',
    "can_share" "VisibilityLevel" NOT NULL DEFAULT 'EVERYONE',
    "can_download" "VisibilityLevel" NOT NULL DEFAULT 'CONNECTIONS',
    "excluded_users" TEXT[],

    CONSTRAINT "post_privacy_pkey" PRIMARY KEY ("post_id")
);

-- CreateTable
CREATE TABLE "post_edit_history" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "old_content" TEXT,
    "new_content" TEXT,
    "changed_fields" JSONB,
    "edited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "edited_by" TEXT NOT NULL,

    CONSTRAINT "post_edit_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "AchievementCategory" NOT NULL DEFAULT 'MANUAL',
    "reputation_points" INTEGER NOT NULL DEFAULT 0,
    "icon" TEXT,
    "badge_image" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "user_id" TEXT NOT NULL,
    "achievement_id" TEXT NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("user_id","achievement_id")
);

-- CreateTable
CREATE TABLE "user_achievement_checks" (
    "user_id" TEXT NOT NULL,
    "last_checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievement_checks_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "portfolio_collections" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_posts" (
    "collection_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_posts_pkey" PRIMARY KEY ("collection_id","post_id")
);

-- CreateTable
CREATE TABLE "post_analytics" (
    "post_id" TEXT NOT NULL,
    "views_by_day" JSONB NOT NULL DEFAULT '{}',
    "likes_by_day" JSONB NOT NULL DEFAULT '{}',
    "comments_by_day" JSONB NOT NULL DEFAULT '{}',
    "engagement_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "top_viewer_roles" JSONB,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_analytics_pkey" PRIMARY KEY ("post_id")
);

-- CreateTable
CREATE TABLE "reputation_config" (
    "id" TEXT NOT NULL,
    "postType" "PostType" NOT NULL,
    "like_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "comment_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "view_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 0.01,
    "share_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    "base_points" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reputation_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "posts_user_id_created_at_idx" ON "posts"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "posts_status_published_at_idx" ON "posts"("status", "published_at");

-- CreateIndex
CREATE INDEX "posts_post_type_status_published_at_idx" ON "posts"("post_type", "status", "published_at");

-- CreateIndex
CREATE INDEX "post_media_post_id_display_order_idx" ON "post_media"("post_id", "display_order");

-- CreateIndex
CREATE INDEX "post_media_media_type_idx" ON "post_media"("media_type");

-- CreateIndex
CREATE INDEX "post_professional_roles_post_id_idx" ON "post_professional_roles"("post_id");

-- CreateIndex
CREATE INDEX "post_professional_roles_user_id_idx" ON "post_professional_roles"("user_id");

-- CreateIndex
CREATE INDEX "post_professional_roles_professional_role_id_idx" ON "post_professional_roles"("professional_role_id");

-- CreateIndex
CREATE INDEX "post_professional_roles_user_id_professional_role_id_idx" ON "post_professional_roles"("user_id", "professional_role_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_professional_roles_post_id_professional_role_id_key" ON "post_professional_roles"("post_id", "professional_role_id");

-- CreateIndex
CREATE UNIQUE INDEX "hashtags_name_key" ON "hashtags"("name");

-- CreateIndex
CREATE INDEX "hashtags_name_idx" ON "hashtags"("name");

-- CreateIndex
CREATE INDEX "hashtags_is_trending_use_count_idx" ON "hashtags"("is_trending", "use_count");

-- CreateIndex
CREATE INDEX "hashtags_is_approved_idx" ON "hashtags"("is_approved");

-- CreateIndex
CREATE INDEX "hashtags_last_used_at_idx" ON "hashtags"("last_used_at");

-- CreateIndex
CREATE INDEX "post_hashtags_hashtag_id_idx" ON "post_hashtags"("hashtag_id");

-- CreateIndex
CREATE INDEX "post_likes_post_id_created_at_idx" ON "post_likes"("post_id", "created_at");

-- CreateIndex
CREATE INDEX "post_likes_user_id_idx" ON "post_likes"("user_id");

-- CreateIndex
CREATE INDEX "post_comments_post_id_created_at_idx" ON "post_comments"("post_id", "created_at");

-- CreateIndex
CREATE INDEX "post_comments_user_id_idx" ON "post_comments"("user_id");

-- CreateIndex
CREATE INDEX "comment_likes_comment_id_idx" ON "comment_likes"("comment_id");

-- CreateIndex
CREATE UNIQUE INDEX "moderation_categories_key_key" ON "moderation_categories"("key");

-- CreateIndex
CREATE INDEX "moderation_categories_key_idx" ON "moderation_categories"("key");

-- CreateIndex
CREATE INDEX "moderation_categories_is_active_display_order_idx" ON "moderation_categories"("is_active", "display_order");

-- CreateIndex
CREATE INDEX "moderation_categories_severity_idx" ON "moderation_categories"("severity");

-- CreateIndex
CREATE INDEX "moderation_reports_queue_id_idx" ON "moderation_reports"("queue_id");

-- CreateIndex
CREATE INDEX "moderation_reports_post_id_idx" ON "moderation_reports"("post_id");

-- CreateIndex
CREATE INDEX "moderation_reports_reported_by_idx" ON "moderation_reports"("reported_by");

-- CreateIndex
CREATE INDEX "moderation_reports_category_key_idx" ON "moderation_reports"("category_key");

-- CreateIndex
CREATE INDEX "moderation_reports_created_at_idx" ON "moderation_reports"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "moderation_reports_post_id_reported_by_key" ON "moderation_reports"("post_id", "reported_by");

-- CreateIndex
CREATE INDEX "moderation_queue_status_priority_created_at_idx" ON "moderation_queue"("status", "priority", "created_at");

-- CreateIndex
CREATE INDEX "moderation_queue_post_id_idx" ON "moderation_queue"("post_id");

-- CreateIndex
CREATE INDEX "moderation_queue_user_id_idx" ON "moderation_queue"("user_id");

-- CreateIndex
CREATE INDEX "moderation_queue_category_key_idx" ON "moderation_queue"("category_key");

-- CreateIndex
CREATE INDEX "moderation_queue_total_weight_idx" ON "moderation_queue"("total_weight");

-- CreateIndex
CREATE UNIQUE INDEX "moderation_queue_post_id_category_key_key" ON "moderation_queue"("post_id", "category_key");

-- CreateIndex
CREATE INDEX "post_edit_history_post_id_edited_at_idx" ON "post_edit_history"("post_id", "edited_at");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_key_key" ON "achievements"("key");

-- CreateIndex
CREATE INDEX "achievements_is_active_category_idx" ON "achievements"("is_active", "category");

-- CreateIndex
CREATE INDEX "user_achievements_user_id_earned_at_idx" ON "user_achievements"("user_id", "earned_at");

-- CreateIndex
CREATE INDEX "portfolio_collections_user_id_display_order_idx" ON "portfolio_collections"("user_id", "display_order");

-- CreateIndex
CREATE INDEX "collection_posts_collection_id_display_order_idx" ON "collection_posts"("collection_id", "display_order");

-- CreateIndex
CREATE UNIQUE INDEX "reputation_config_postType_key" ON "reputation_config"("postType");

-- CreateIndex
CREATE INDEX "user_professional_roles_reputation_points_idx" ON "user_professional_roles"("reputation_points");

-- CreateIndex
CREATE INDEX "users_total_reputation_idx" ON "users"("total_reputation");

-- CreateIndex
CREATE INDEX "users_account_status_idx" ON "users"("account_status");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_media" ADD CONSTRAINT "post_media_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_professional_roles" ADD CONSTRAINT "post_professional_roles_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_professional_roles" ADD CONSTRAINT "post_professional_roles_professional_role_id_fkey" FOREIGN KEY ("professional_role_id") REFERENCES "professional_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_professional_roles" ADD CONSTRAINT "post_professional_roles_user_id_professional_role_id_fkey" FOREIGN KEY ("user_id", "professional_role_id") REFERENCES "user_professional_roles"("user_id", "professional_role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_hashtags" ADD CONSTRAINT "post_hashtags_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_hashtags" ADD CONSTRAINT "post_hashtags_hashtag_id_fkey" FOREIGN KEY ("hashtag_id") REFERENCES "hashtags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "post_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_reports" ADD CONSTRAINT "moderation_reports_category_key_fkey" FOREIGN KEY ("category_key") REFERENCES "moderation_categories"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_reports" ADD CONSTRAINT "moderation_reports_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "moderation_queue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_reports" ADD CONSTRAINT "moderation_reports_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_reports" ADD CONSTRAINT "moderation_reports_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_queue" ADD CONSTRAINT "moderation_queue_category_key_fkey" FOREIGN KEY ("category_key") REFERENCES "moderation_categories"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_queue" ADD CONSTRAINT "moderation_queue_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_queue" ADD CONSTRAINT "moderation_queue_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_queue" ADD CONSTRAINT "moderation_queue_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_post_rate_limits" ADD CONSTRAINT "user_post_rate_limits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_privacy" ADD CONSTRAINT "post_privacy_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_edit_history" ADD CONSTRAINT "post_edit_history_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievement_checks" ADD CONSTRAINT "user_achievement_checks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_collections" ADD CONSTRAINT "portfolio_collections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_posts" ADD CONSTRAINT "collection_posts_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "portfolio_collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_posts" ADD CONSTRAINT "collection_posts_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_analytics" ADD CONSTRAINT "post_analytics_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
