-- AlterTable
ALTER TABLE "actions" ADD COLUMN     "constraints" JSONB,
ADD COLUMN     "min_role_priority" INTEGER;

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "actions_min_role_priority_idx" ON "actions"("min_role_priority");

-- CreateIndex
CREATE INDEX "roles_priority_idx" ON "roles"("priority");
