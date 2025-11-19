DO $$
BEGIN
  CREATE TYPE "user_role" AS ENUM ('subscriber', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS "role" "user_role";

UPDATE "user"
SET "role" = 'subscriber'
WHERE "role" IS NULL;

ALTER TABLE "user"
ALTER COLUMN "role" SET NOT NULL;

ALTER TABLE "user"
ALTER COLUMN "role" SET DEFAULT 'subscriber';

DROP TABLE IF EXISTS "todo";

