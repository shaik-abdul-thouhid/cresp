-- CreateTable
CREATE TABLE "user_feedback" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "feedback_type" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "rating" INTEGER,
    "comment" TEXT,
    "url" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_prompt_log" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "shown" BOOLEAN NOT NULL DEFAULT true,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "responded" BOOLEAN NOT NULL DEFAULT false,
    "shown_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_prompt_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_feedback_user_id_created_at_idx" ON "user_feedback"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "user_feedback_feedback_type_idx" ON "user_feedback"("feedback_type");

-- CreateIndex
CREATE INDEX "user_feedback_trigger_idx" ON "user_feedback"("trigger");

-- CreateIndex
CREATE INDEX "feedback_prompt_log_user_id_shown_at_idx" ON "feedback_prompt_log"("user_id", "shown_at");

-- CreateIndex
CREATE INDEX "feedback_prompt_log_trigger_idx" ON "feedback_prompt_log"("trigger");

-- AddForeignKey
ALTER TABLE "user_feedback" ADD CONSTRAINT "user_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_prompt_log" ADD CONSTRAINT "feedback_prompt_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
