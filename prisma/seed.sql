-- ============================================
-- SEED: Roles, Actions, and Authorizations
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
-- 2. ACTIONS (with minimum role requirements and constraints)
-- ============================================
INSERT INTO "actions" (id, key, resource, description, min_role_priority, constraints, created_at, updated_at)
VALUES
    -- User/Profile actions (public can view, members can update)
    -- ('action_profile_view_001', 'profile.view', 'Profile', 'View user profile', NULL, NULL, NOW(), NOW()),
    -- ('action_profile_update_001', 'profile.update', 'Profile', 'Update own profile', 10, NULL, NOW(), NOW()),
    -- ('action_profile_delete_001', 'profile.delete', 'Profile', 'Delete own profile', 10, NULL, NOW(), NOW()),
	
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

	-- Referral actions
	('action_referral_generate_001', 'referral.generate', 'Referral', 'User generated referral code', 20, NULL, NOW(), NOW()),
	('action_referral_view_001', 'referral.view', 'Referral', 'User viewed referral stats', 20, NULL, NOW(), NOW()),
	('action_referral_click_001', 'referral.click', 'Referral', 'Anonymous user clicked referral link', 0, NULL, NOW(), NOW()),
	('action_referral_signup_001', 'referral.signup', 'Referral', 'User signed up via referral', 0, NULL, NOW(), NOW()),

	-- Onboarding actions
	('action_onboarding_complete_001', 'onboarding.complete', 'Onboarding', 'User completed onboarding', 0, NULL, NOW(), NOW()),
	('action_onboarding_skip_001', 'onboarding.skip', 'Onboarding', 'User skipped onboarding', 0, NULL, NOW(), NOW())
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
-- 4. ROLE → ACTION AUTHORIZATIONS (Optional)
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
-- 5. PROFESSIONAL/CREATIVE ROLES
-- ============================================
-- Note: Using gen_random_uuid() for PostgreSQL or manually generate CUIDs
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
    ('prof_choreographer_001', 'choreographer', 'Choreographer', NULL, '💃', 'performance', 20, true, NOW(), NOW())
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
-- VERIFICATION
-- ============================================
-- Check counts
SELECT 'Roles:' as entity, COUNT(*) as count FROM "roles"
UNION ALL
SELECT 'Actions:', COUNT(*) FROM "actions"
UNION ALL
SELECT 'Professional Roles:', COUNT(*) FROM "professional_roles";

