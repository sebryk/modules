-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM (
    'NEW',
    'IN_PROGRESS',
    'DONE',
    'CANCELLED'
);

-- CreateTable
CREATE TABLE "applications" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'NEW',
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "applications_created_by_idx" ON "applications"("created_by");

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
