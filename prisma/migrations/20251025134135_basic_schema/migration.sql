-- CreateTable
CREATE TABLE "professional_roles" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "category" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professional_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_professional_roles" (
    "user_id" TEXT NOT NULL,
    "professional_role_id" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "years_experience" INTEGER,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_professional_roles_pkey" PRIMARY KEY ("user_id","professional_role_id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "action" TEXT NOT NULL,
    "action_category" TEXT NOT NULL,
    "resource_type" TEXT,
    "resource_id" TEXT,
    "method" TEXT,
    "endpoint" TEXT,
    "status" TEXT NOT NULL DEFAULT 'success',
    "changes_before" JSONB,
    "changes_after" JSONB,
    "metadata" JSONB,
    "error_message" TEXT,
    "duration" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "professional_roles_key_key" ON "professional_roles"("key");

-- CreateIndex
CREATE INDEX "professional_roles_category_idx" ON "professional_roles"("category");

-- CreateIndex
CREATE INDEX "professional_roles_is_active_idx" ON "professional_roles"("is_active");

-- CreateIndex
CREATE INDEX "professional_roles_key_idx" ON "professional_roles"("key");

-- CreateIndex
CREATE INDEX "user_professional_roles_user_id_idx" ON "user_professional_roles"("user_id");

-- CreateIndex
CREATE INDEX "user_professional_roles_professional_role_id_idx" ON "user_professional_roles"("professional_role_id");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_idx" ON "activity_logs"("user_id");

-- CreateIndex
CREATE INDEX "activity_logs_action_idx" ON "activity_logs"("action");

-- CreateIndex
CREATE INDEX "activity_logs_action_category_idx" ON "activity_logs"("action_category");

-- CreateIndex
CREATE INDEX "activity_logs_resource_type_resource_id_idx" ON "activity_logs"("resource_type", "resource_id");

-- CreateIndex
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs"("created_at");

-- CreateIndex
CREATE INDEX "activity_logs_status_idx" ON "activity_logs"("status");

-- CreateIndex
CREATE INDEX "user_roles_user_id_idx" ON "user_roles"("user_id");

-- AddForeignKey
ALTER TABLE "user_professional_roles" ADD CONSTRAINT "user_professional_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_professional_roles" ADD CONSTRAINT "user_professional_roles_professional_role_id_fkey" FOREIGN KEY ("professional_role_id") REFERENCES "professional_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
