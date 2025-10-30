-- CreateEnum
CREATE TYPE "ProfessionalRoleStatus" AS ENUM ('ACTIVE', 'LEARNING', 'INACTIVE', 'PAST_EXPERIENCE');

-- AlterTable
ALTER TABLE "user_professional_roles" ADD COLUMN     "status" "ProfessionalRoleStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "user_reports" (
    "id" TEXT NOT NULL,
    "reported_user_id" TEXT NOT NULL,
    "reported_by" TEXT NOT NULL,
    "category_key" TEXT NOT NULL,
    "reason" TEXT,
    "status" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "ModerationPriority" NOT NULL DEFAULT 'NORMAL',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "resolution" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_reports_reported_user_id_idx" ON "user_reports"("reported_user_id");

-- CreateIndex
CREATE INDEX "user_reports_reported_by_idx" ON "user_reports"("reported_by");

-- CreateIndex
CREATE INDEX "user_reports_category_key_idx" ON "user_reports"("category_key");

-- CreateIndex
CREATE INDEX "user_reports_status_priority_idx" ON "user_reports"("status", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "user_reports_reported_user_id_reported_by_key" ON "user_reports"("reported_user_id", "reported_by");

-- CreateIndex
CREATE INDEX "user_professional_roles_status_idx" ON "user_professional_roles"("status");

-- AddForeignKey
ALTER TABLE "user_reports" ADD CONSTRAINT "user_reports_reported_user_id_fkey" FOREIGN KEY ("reported_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_reports" ADD CONSTRAINT "user_reports_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
