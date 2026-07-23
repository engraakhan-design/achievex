-- Milestone 3: Organization and User Management
CREATE TYPE "TeamMemberRole" AS ENUM ('LEAD', 'MEMBER');
ALTER TABLE "User" ADD COLUMN "jobTitle" TEXT;
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "User" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'en';
ALTER TABLE "Department" ADD COLUMN "description" TEXT;
ALTER TABLE "Team" ADD COLUMN "description" TEXT;
ALTER TABLE "TeamMember" ADD COLUMN "role" "TeamMemberRole" NOT NULL DEFAULT 'MEMBER';
