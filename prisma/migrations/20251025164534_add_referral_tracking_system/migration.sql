-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('SIGNED_UP', 'EMAIL_VERIFIED', 'PROFILE_COMPLETED', 'FIRST_POST', 'FIRST_COLLABORATION', 'ACTIVE_USER');

-- CreateTable
CREATE TABLE "referral_codes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "total_clicks" INTEGER NOT NULL DEFAULT 0,
    "total_signups" INTEGER NOT NULL DEFAULT 0,
    "total_conversions" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referral_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_clicks" (
    "id" TEXT NOT NULL,
    "referral_code_id" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "referrer_url" TEXT,
    "landing_page" TEXT,
    "converted_to_signup" BOOLEAN NOT NULL DEFAULT false,
    "converted_user_id" TEXT,
    "converted_at" TIMESTAMP(3),
    "clicked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "referral_code_id" TEXT NOT NULL,
    "referrer_id" TEXT NOT NULL,
    "referred_id" TEXT NOT NULL,
    "status" "ReferralStatus" NOT NULL DEFAULT 'SIGNED_UP',
    "signed_up_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email_verified_at" TIMESTAMP(3),
    "profile_completed_at" TIMESTAMP(3),
    "first_post_at" TIMESTAMP(3),
    "first_collaboration_at" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "referral_codes_user_id_key" ON "referral_codes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "referral_codes_code_key" ON "referral_codes"("code");

-- CreateIndex
CREATE INDEX "referral_codes_code_idx" ON "referral_codes"("code");

-- CreateIndex
CREATE INDEX "referral_codes_user_id_idx" ON "referral_codes"("user_id");

-- CreateIndex
CREATE INDEX "referral_codes_is_active_idx" ON "referral_codes"("is_active");

-- CreateIndex
CREATE INDEX "referral_clicks_referral_code_id_idx" ON "referral_clicks"("referral_code_id");

-- CreateIndex
CREATE INDEX "referral_clicks_ip_address_idx" ON "referral_clicks"("ip_address");

-- CreateIndex
CREATE INDEX "referral_clicks_converted_user_id_idx" ON "referral_clicks"("converted_user_id");

-- CreateIndex
CREATE INDEX "referral_clicks_clicked_at_idx" ON "referral_clicks"("clicked_at");

-- CreateIndex
CREATE INDEX "referral_clicks_converted_to_signup_idx" ON "referral_clicks"("converted_to_signup");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_referred_id_key" ON "referrals"("referred_id");

-- CreateIndex
CREATE INDEX "referrals_referrer_id_idx" ON "referrals"("referrer_id");

-- CreateIndex
CREATE INDEX "referrals_referred_id_idx" ON "referrals"("referred_id");

-- CreateIndex
CREATE INDEX "referrals_referral_code_id_idx" ON "referrals"("referral_code_id");

-- CreateIndex
CREATE INDEX "referrals_status_idx" ON "referrals"("status");

-- CreateIndex
CREATE INDEX "referrals_signed_up_at_idx" ON "referrals"("signed_up_at");

-- AddForeignKey
ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_clicks" ADD CONSTRAINT "referral_clicks_referral_code_id_fkey" FOREIGN KEY ("referral_code_id") REFERENCES "referral_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_id_fkey" FOREIGN KEY ("referred_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referral_code_id_fkey" FOREIGN KEY ("referral_code_id") REFERENCES "referral_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
