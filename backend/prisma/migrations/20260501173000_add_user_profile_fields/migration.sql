-- AlterTable
ALTER TABLE "users"
ADD COLUMN "first_name" VARCHAR(255),
ADD COLUMN "last_name" VARCHAR(255),
ADD COLUMN "position" VARCHAR(255);

-- Backfill existing users before enforcing NOT NULL.
UPDATE "users"
SET
    "first_name" = COALESCE("first_name", 'Unknown'),
    "last_name" = COALESCE("last_name", 'Unknown'),
    "position" = COALESCE("position", 'Unspecified');

-- AlterTable
ALTER TABLE "users"
ALTER COLUMN "first_name" SET NOT NULL,
ALTER COLUMN "last_name" SET NOT NULL,
ALTER COLUMN "position" SET NOT NULL;
