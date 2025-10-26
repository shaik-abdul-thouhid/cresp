-- ============================================
-- SEED: Roles, Actions, Professional Roles, and Initial Data
-- ============================================
-- This file is idempotent: re-running won't create duplicates
-- Run with: psql $DATABASE_URL -f prisma/seed.sql
-- Or via migration: npx prisma migrate dev

-- ============================================
-- 1. ROLES (with hierarchy via priority)
-- ============================================
INSERT INTO "roles" (id, key, name, description, priority, created_at, updated_at)
VALUES
    ('role_guest_001', 'guest', 'Guest', 'Limited read-only access', 0, NOW(), NOW()),
    ('role_member_001', 'member', 'Member', 'Standard user access', 20, NOW(), NOW()),
    ('role_moderator_001', 'moderator', 'Moderator', 'Content moderation access', 40, NOW(), NOW()),
    ('role_admin_001', 'admin', 'Administrator', 'Full system access', 60, NOW(), NOW())
ON CONFLICT (key) 
DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    priority = EXCLUDED.priority,
    updated_at = NOW();

-- ============================================
-- 2. ACTIONS (with minimum role requirements)
-- ============================================
INSERT INTO "actions" (id, key, resource, description, min_role_priority, constraints, created_at, updated_at)
VALUES
    -- Authentication actions
    ('action_auth_signup_001', 'auth.signup', 'Authentication', 'User signed up', 0, NULL, NOW(), NOW()),
    ('action_auth_login_001', 'auth.login', 'Authentication', 'User logged in', 0, NULL, NOW(), NOW()),
    ('action_auth_email_verify_request_001', 'auth.email_verify_request', 'Authentication', 'User requested email verification', 0, NULL, NOW(), NOW()),
    ('action_auth_email_verify_consume_001', 'auth.email_verify_consume', 'Authentication', 'User consumed email verification token', 0, NULL, NOW(), NOW()),
    ('action_auth_password_reset_request_001', 'auth.password_reset_request', 'Authentication', 'User requested password reset', 0, NULL, NOW(), NOW()),
    ('action_auth_password_reset_consume_001', 'auth.password_reset_consume', 'Authentication', 'User consumed password reset token', 0, NULL, NOW(), NOW()),
    ('action_auth_password_change_001', 'auth.password_change', 'Authentication', 'User changed password', 0, NULL, NOW(), NOW()),
    ('action_auth_logout_001', 'auth.logout', 'Authentication', 'User logged out', 0, NULL, NOW(), NOW()),
    ('action_auth_session_invalidate_001', 'auth.session_invalidate', 'Authentication', 'User invalidated session', 0, NULL, NOW(), NOW()),
    ('action_auth_session_revoke_001', 'auth.session_revoke', 'Authentication', 'User revoked session', 0, NULL, NOW(), NOW()),
    ('action_auth_verify_email_001', 'auth.verify_email', 'Authentication', 'User verified email', 0, NULL, NOW(), NOW()),
    ('action_auth_password_reset_001', 'auth.password_reset', 'Authentication', 'User reset password', 0, NULL, NOW(), NOW()),

    -- Referral actions (MVP: Set to 0 for all users)
    ('action_referral_generate_001', 'referral.generate', 'Referral', 'User generated referral code', 0, NULL, NOW(), NOW()),
    ('action_referral_view_001', 'referral.view', 'Referral', 'User viewed referral stats', 0, NULL, NOW(), NOW()),
    ('action_referral_click_001', 'referral.click', 'Referral', 'Anonymous user clicked referral link', 0, NULL, NOW(), NOW()),
    ('action_referral_signup_001', 'referral.signup', 'Referral', 'User signed up via referral', 0, NULL, NOW(), NOW()),

    -- Onboarding actions
    ('action_onboarding_complete_001', 'onboarding.complete', 'Onboarding', 'User completed onboarding', 0, NULL, NOW(), NOW()),
    ('action_onboarding_skip_001', 'onboarding.skip', 'Onboarding', 'User skipped onboarding', 0, NULL, NOW(), NOW()),

    -- Profile actions (MVP: Set to 0 for all users)
    ('action_profile_view_001', 'profile.view', 'Profile', 'User viewed profile', 0, NULL, NOW(), NOW()),
    ('action_profile_update_001', 'profile.update', 'Profile', 'User updated profile', 0, NULL, NOW(), NOW()),
    ('action_profile_delete_001', 'profile.delete', 'Profile', 'User deleted profile', 0, NULL, NOW(), NOW()),

    -- Post/Content actions (MVP: Set to 0 for all users)
    ('action_post_create_001', 'post.create', 'Post', 'User created post', 0, NULL, NOW(), NOW()),
    ('action_post_update_001', 'post.update', 'Post', 'User updated post', 0, NULL, NOW(), NOW()),
    ('action_post_delete_001', 'post.delete', 'Post', 'User deleted post', 0, NULL, NOW(), NOW()),
    ('action_post_view_001', 'post.view', 'Post', 'User viewed post', 0, NULL, NOW(), NOW()),
    ('action_post_like_001', 'post.like', 'Post', 'User liked post', 0, NULL, NOW(), NOW()),
    ('action_post_unlike_001', 'post.unlike', 'Post', 'User unliked post', 0, NULL, NOW(), NOW()),
    ('action_post_comment_001', 'post.comment', 'Post', 'User commented on post', 0, NULL, NOW(), NOW()),
    ('action_post_share_001', 'post.share', 'Post', 'User shared post', 0, NULL, NOW(), NOW()),

    -- Admin actions
    ('action_admin_role_assign_001', 'admin.role_assign', 'Admin', 'Admin assigned role', 60, NULL, NOW(), NOW()),
    ('action_admin_role_remove_001', 'admin.role_remove', 'Admin', 'Admin removed role', 60, NULL, NOW(), NOW()),
    ('action_admin_user_ban_001', 'admin.user_ban', 'Admin', 'Admin banned user', 60, NULL, NOW(), NOW()),
    ('action_admin_user_unban_001', 'admin.user_unban', 'Admin', 'Admin unbanned user', 60, NULL, NOW(), NOW()),
    ('action_admin_post_moderate_001', 'admin.post_moderate', 'Admin', 'Admin moderated post', 40, NULL, NOW(), NOW()),

    -- System actions
    ('action_system_error_001', 'system.error', 'System', 'System error occurred', 0, NULL, NOW(), NOW()),
    ('action_http_request_001', 'http.request', 'System', 'HTTP request received', 0, NULL, NOW(), NOW()),

    -- Feedback actions
    ('action_feedback_prompt_shown_001', 'feedback.prompt_shown', 'Feedback', 'Feedback prompt shown to user', 0, NULL, NOW(), NOW()),
    ('action_feedback_prompt_dismissed_001', 'feedback.prompt_dismissed', 'Feedback', 'User dismissed feedback prompt', 0, NULL, NOW(), NOW()),
    ('action_feedback_submit_001', 'feedback.submit', 'Feedback', 'User submitted feedback', 0, NULL, NOW(), NOW())
ON CONFLICT (key) 
DO UPDATE SET 
    resource = EXCLUDED.resource,
    description = EXCLUDED.description,
    min_role_priority = EXCLUDED.min_role_priority,
    constraints = EXCLUDED.constraints,
    updated_at = NOW();

-- ============================================
-- 3. DEFAULT ADMIN USER
-- ============================================
-- Create a default admin user for initial setup
-- Username: admin
-- Email: admin@cresp.local
-- Password: Admin@123 (change this immediately after first login!)

-- Insert User
INSERT INTO "users" (id, email, username, name, onboarding_completed, created_at, updated_at)
VALUES 
    ('user_admin_001', 'admin@cresp.local', 'admin', 'System Administrator', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert Auth Account with hashed password
-- Password: Admin@123
-- Generated with: bun run scripts/generate-admin-hash.ts "Admin@123"
INSERT INTO "auth_accounts" (user_id, password_hash, is_verified, created_at, updated_at)
VALUES 
    ('user_admin_001', '$2a$12$qIpQhk2jEPXaivN54tuwyeyzmOXxPwjv5psnvEtKuSa2U0TlJRvk.', true, NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Assign Admin Role
INSERT INTO "user_roles" (user_id, role_id, assigned_at)
VALUES 
    ('user_admin_001', 'role_admin_001', NOW())
ON CONFLICT (user_id, role_id) DO NOTHING;

-- ============================================
-- 4. PROFESSIONAL/CREATIVE ROLES
-- ============================================
INSERT INTO "professional_roles" (id, key, name, description, icon, category, display_order, is_active, created_at, updated_at)
VALUES
    ('prof_director_001', 'director', 'Director', NULL, '🎬', 'film_video', 1, true, NOW(), NOW()),
    ('prof_actor_001', 'actor', 'Actor', NULL, '🎭', 'film_theater', 2, true, NOW(), NOW()),
    ('prof_writer_001', 'writer', 'Writer', NULL, '✍️', 'writing', 3, true, NOW(), NOW()),
    ('prof_screenplay_001', 'screenplay_writer', 'Screenplay Writer', NULL, '📝', 'writing', 4, true, NOW(), NOW()),
    ('prof_cinematographer_001', 'cinematographer', 'Cinematographer', NULL, '📹', 'film_video', 5, true, NOW(), NOW()),
    ('prof_photographer_001', 'photographer', 'Photographer', NULL, '📸', 'visual', 6, true, NOW(), NOW()),
    ('prof_video_editor_001', 'video_editor', 'Video Editor', NULL, '✂️', 'film_video', 7, true, NOW(), NOW()),
    ('prof_producer_001', 'producer', 'Producer', NULL, '🎙️', 'film_video', 8, true, NOW(), NOW()),
    ('prof_singer_001', 'singer', 'Singer', NULL, '🎤', 'music', 9, true, NOW(), NOW()),
    ('prof_musician_001', 'musician', 'Musician', NULL, '🎵', 'music', 10, true, NOW(), NOW()),
    ('prof_lyricist_001', 'lyricist', 'Lyricist', NULL, '🎶', 'music', 11, true, NOW(), NOW()),
    ('prof_composer_001', 'composer', 'Composer', NULL, '🎼', 'music', 12, true, NOW(), NOW()),
    ('prof_sound_designer_001', 'sound_designer', 'Sound Designer', NULL, '🔊', 'audio', 13, true, NOW(), NOW()),
    ('prof_graphic_designer_001', 'graphic_designer', 'Graphic Designer', NULL, '🎨', 'visual', 14, true, NOW(), NOW()),
    ('prof_animator_001', 'animator', 'Animator', NULL, '🎞️', 'visual', 15, true, NOW(), NOW()),
    ('prof_vfx_artist_001', 'vfx_artist', 'VFX Artist', NULL, '✨', 'visual', 16, true, NOW(), NOW()),
    ('prof_art_director_001', 'art_director', 'Art Director', NULL, '🖼️', 'visual', 17, true, NOW(), NOW()),
    ('prof_costume_designer_001', 'costume_designer', 'Costume Designer', NULL, '👔', 'design', 18, true, NOW(), NOW()),
    ('prof_makeup_artist_001', 'makeup_artist', 'Makeup Artist', NULL, '💄', 'design', 19, true, NOW(), NOW()),
    ('prof_choreographer_001', 'choreographer', 'Choreographer', NULL, '💃', 'performance', 20, true, NOW(), NOW()),
	('prof_artist_001', 'artist', 'Artist', NULL, '🎨', 'visual', 21, true, NOW(), NOW())
ON CONFLICT (key)
DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ============================================
-- 5. MODERATION CATEGORIES (Admin Configurable)
-- ============================================
INSERT INTO "moderation_categories" (id, key, name, description, severity, auto_action, requires_proof, icon, color, display_order, is_active, created_at, updated_at)
VALUES
    (
        'mod_cat_ai_undisclosed',
        'ai_undisclosed',
        'AI Content Not Disclosed',
        'Content appears to be AI-generated but user did not disclose it',
        2,
        NULL,
        false,
        '🤖',
        '#f59e0b',
        1,
        true,
        NOW(),
        NOW()
    ),
    (
        'mod_cat_nsfw',
        'nsfw',
        'NSFW Content',
        'Content contains nudity, sexual content, or graphic violence',
        4,
        'remove',
        false,
        '🔞',
        '#ef4444',
        2,
        true,
        NOW(),
        NOW()
    ),
    (
        'mod_cat_spam',
        'spam',
        'Spam',
        'Unsolicited advertising, repeated posts, or promotional content',
        3,
        'warn',
        false,
        '📧',
        '#f97316',
        3,
        true,
        NOW(),
        NOW()
    ),
    (
        'mod_cat_harassment',
        'harassment',
        'Harassment',
        'Bullying, threatening, or targeting individuals or groups',
        5,
        'ban',
        true,
        '⚠️',
        '#dc2626',
        4,
        true,
        NOW(),
        NOW()
    ),
    (
        'mod_cat_copyright',
        'copyright',
        'Copyright Violation',
        'Content uses copyrighted material without permission',
        4,
        'remove',
        true,
        '©️',
        '#8b5cf6',
        5,
        true,
        NOW(),
        NOW()
    ),
    (
        'mod_cat_misinformation',
        'misinformation',
        'Misinformation',
        'Deliberately false or misleading information',
        3,
        NULL,
        true,
        '❌',
        '#dc2626',
        6,
        true,
        NOW(),
        NOW()
    ),
    (
        'mod_cat_fake_content',
        'fake_content',
        'Fake/Manipulated Content',
        'Deepfakes, altered images, or fabricated content',
        5,
        'remove',
        true,
        '🎭',
        '#be123c',
        7,
        true,
        NOW(),
        NOW()
    ),
    (
        'mod_cat_off_topic',
        'off_topic',
        'Off-Topic Content',
        'Content not related to creative work or collaboration',
        1,
        NULL,
        false,
        '📍',
        '#6b7280',
        8,
        true,
        NOW(),
        NOW()
    ),
    (
        'mod_cat_hate_speech',
        'hate_speech',
        'Hate Speech',
        'Content promoting hate or discrimination based on identity',
        5,
        'ban',
        true,
        '🚫',
        '#991b1b',
        9,
        true,
        NOW(),
        NOW()
    ),
    (
        'mod_cat_self_harm',
        'self_harm',
        'Self-Harm Content',
        'Content promoting or glorifying self-harm or suicide',
        5,
        'remove',
        false,
        '💔',
        '#7f1d1d',
        10,
        true,
        NOW(),
        NOW()
    ),
    (
        'mod_cat_other',
        'other',
        'Other',
        'Other issues not covered by specific categories',
        1,
        NULL,
        false,
        '📝',
        '#9ca3af',
        99,
        true,
        NOW(),
        NOW()
    )
ON CONFLICT (key)
DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    severity = EXCLUDED.severity,
    auto_action = EXCLUDED.auto_action,
    requires_proof = EXCLUDED.requires_proof,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ============================================
-- 6. ACHIEVEMENTS (Initial Set)
-- ============================================
INSERT INTO "achievements" (id, key, name, description, category, reputation_points, icon, badge_image, is_active, created_at)
VALUES
    (
        'ach_first_post',
        'first_post',
        'First Post! 🎉',
        'Created your first post',
        'POST_COUNT',
        10,
        '🎉',
        NULL,
        true,
        NOW()
    ),
    (
        'ach_ten_posts',
        'ten_posts',
        '10 Posts Strong 💪',
        'Created 10 posts',
        'POST_COUNT',
        50,
        '💪',
        NULL,
        true,
        NOW()
    ),
    (
        'ach_fifty_posts',
        'fifty_posts',
        'Content Creator 🌟',
        'Created 50 posts',
        'POST_COUNT',
        200,
        '🌟',
        NULL,
        true,
        NOW()
    ),
    (
        'ach_first_portfolio',
        'first_portfolio',
        'Portfolio Debut ⭐',
        'Created your first portfolio post',
        'POST_COUNT',
        25,
        '⭐',
        NULL,
        true,
        NOW()
    ),
    (
        'ach_viral_100',
        'viral_100',
        'Popular Post 🔥',
        'Got 100 likes on a single post',
        'LIKES',
        50,
        '🔥',
        NULL,
        true,
        NOW()
    ),
    (
        'ach_viral_500',
        'viral_500',
        'Viral! 🚀',
        'Got 500 likes on a single post',
        'LIKES',
        100,
        '🚀',
        NULL,
        true,
        NOW()
    ),
    (
        'ach_viral_1000',
        'viral_1000',
        'Superstar 💫',
        'Got 1000 likes on a single post',
        'LIKES',
        250,
        '💫',
        NULL,
        true,
        NOW()
    ),
    (
        'ach_first_like',
        'first_like',
        'First Like ❤️',
        'Received your first like',
        'LIKES',
        5,
        '❤️',
        NULL,
        true,
        NOW()
    ),
    (
        'ach_first_comment',
        'first_comment',
        'Conversation Starter 💬',
        'Received your first comment',
        'ENGAGEMENT',
        5,
        '💬',
        NULL,
        true,
        NOW()
    ),
    (
        'ach_100_comments',
        'hundred_comments',
        'Community Favorite 🌈',
        'Received 100 total comments across all posts',
        'ENGAGEMENT',
        100,
        '🌈',
        NULL,
        true,
        NOW()
    )
ON CONFLICT (key)
DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    reputation_points = EXCLUDED.reputation_points,
    icon = EXCLUDED.icon,
    is_active = EXCLUDED.is_active;

-- ============================================
-- 7. REPUTATION CONFIG (Default Values)
-- ============================================
INSERT INTO "reputation_config" (id, "postType", like_multiplier, comment_multiplier, view_multiplier, share_multiplier, base_points, updated_at)
VALUES
    ('rep_casual', 'CASUAL', 1.0, 1.0, 0.01, 2.0, 5, NOW()),
    ('rep_portfolio', 'PORTFOLIO', 5.0, 2.0, 0.05, 5.0, 25, NOW())
ON CONFLICT ("postType")
DO UPDATE SET
    like_multiplier = EXCLUDED.like_multiplier,
    comment_multiplier = EXCLUDED.comment_multiplier,
    view_multiplier = EXCLUDED.view_multiplier,
    share_multiplier = EXCLUDED.share_multiplier,
    base_points = EXCLUDED.base_points,
    updated_at = NOW();

-- ============================================
-- 8. ROLE → ACTION AUTHORIZATIONS (Optional)
-- ============================================
-- NOTE: With priority-based authorization (minRolePriority), explicit
-- authorizations are optional. Use them only for:
--   - DENY overrides (block specific users/roles)
--   - Exception grants (allow below minimum priority)
--   - Special cases requiring explicit permission

-- Example: Block a specific user from an action
-- INSERT INTO "authorizations" (id, subject_type, subject_id, action_id, effect, created_at)
-- VALUES ('authz_deny_user_123', 'USER', 'user_123', 'action_post_create_001', 'DENY', NOW());

-- Example: Grant special permission to a guest user
-- INSERT INTO "authorizations" (id, subject_type, subject_id, action_id, effect, created_at)
-- VALUES ('authz_special_guest', 'USER', 'user_xyz', 'action_post_moderate_001', 'ALLOW', NOW());

-- ============================================
-- VERIFICATION
-- ============================================
-- Check counts
SELECT 'Roles:' as entity, COUNT(*) as count FROM "roles"
UNION ALL
SELECT 'Actions:', COUNT(*) FROM "actions"
UNION ALL
SELECT 'Professional Roles:', COUNT(*) FROM "professional_roles"
UNION ALL
SELECT 'Moderation Categories:', COUNT(*) FROM "moderation_categories"
UNION ALL
SELECT 'Achievements:', COUNT(*) FROM "achievements"
UNION ALL
SELECT 'Reputation Configs:', COUNT(*) FROM "reputation_config";
