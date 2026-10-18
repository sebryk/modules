-- Enum order defines employee status sorting.
CREATE TYPE "UserStatus" AS ENUM ('active', 'invited', 'vacation');

ALTER TABLE "users"
ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'active',
ADD COLUMN "avatar_url" VARCHAR(2048);
