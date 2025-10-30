-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('COMPLETED', 'ONGOING', 'CONCEPT');

-- CreateEnum
CREATE TYPE "ProjectScale" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('PERSONAL', 'FREELANCE', 'AGENCY', 'COMPANY', 'OPEN_SOURCE');

-- CreateTable
CREATE TABLE "portfolio_posts" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "project_title" TEXT NOT NULL,
    "project_type" TEXT,
    "project_status" "ProjectStatus" NOT NULL DEFAULT 'COMPLETED',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "duration" TEXT,
    "user_role" TEXT NOT NULL,
    "team_size" INTEGER,
    "is_team_project" BOOLEAN NOT NULL DEFAULT false,
    "responsibilities" TEXT[],
    "key_contributions" TEXT,
    "technologies" TEXT[],
    "tools" TEXT[],
    "skills" TEXT[],
    "live_url" TEXT,
    "repository_url" TEXT,
    "case_study_url" TEXT,
    "external_links" JSONB,
    "problem_statement" TEXT,
    "solution" TEXT,
    "impact" TEXT,
    "challenges" TEXT,
    "lessons_learned" TEXT,
    "metrics" JSONB,
    "awards" TEXT[],
    "testimonial" JSONB,
    "cover_image_id" TEXT,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_highlight" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "industry" TEXT,
    "target_audience" TEXT,
    "client_type" "ClientType",
    "project_scale" "ProjectScale",
    "client_name" TEXT,
    "client_industry" TEXT,
    "collaborators" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_posts_post_id_key" ON "portfolio_posts"("post_id");

-- CreateIndex
CREATE INDEX "portfolio_posts_project_type_idx" ON "portfolio_posts"("project_type");

-- CreateIndex
CREATE INDEX "portfolio_posts_project_status_idx" ON "portfolio_posts"("project_status");

-- CreateIndex
CREATE INDEX "portfolio_posts_category_idx" ON "portfolio_posts"("category");

-- CreateIndex
CREATE INDEX "portfolio_posts_is_featured_idx" ON "portfolio_posts"("is_featured");

-- CreateIndex
CREATE INDEX "portfolio_posts_is_highlight_idx" ON "portfolio_posts"("is_highlight");

-- AddForeignKey
ALTER TABLE "portfolio_posts" ADD CONSTRAINT "portfolio_posts_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
