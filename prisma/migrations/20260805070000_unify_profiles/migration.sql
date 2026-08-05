-- DropForeignKey
ALTER TABLE "ChildProfile" DROP CONSTRAINT "ChildProfile_parentId_fkey";

-- DropForeignKey
ALTER TABLE "ChildReadingProgress" DROP CONSTRAINT "ChildReadingProgress_childProfileId_fkey";

-- DropForeignKey
ALTER TABLE "ChildReadingProgress" DROP CONSTRAINT "ChildReadingProgress_ebookId_fkey";

-- DropForeignKey
ALTER TABLE "Collection" DROP CONSTRAINT "Collection_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_customerId_fkey";

-- DropForeignKey
ALTER TABLE "ReadingProgress" DROP CONSTRAINT "ReadingProgress_customerId_fkey";

-- DropIndex
DROP INDEX "Favorite_customerId_ebookId_key";

-- DropIndex
DROP INDEX "ReadingProgress_customerId_ebookId_key";

-- These tables move from customer-scoped to profile-scoped, and there's no way to map
-- pre-existing customerId rows onto a profile automatically. This app has no production
-- users yet, so clearing them here (rather than failing the NOT NULL column adds below on
-- any existing rows) is safe.
TRUNCATE TABLE "Favorite", "Collection", "ReadingProgress" RESTART IDENTITY CASCADE;

-- AlterTable
ALTER TABLE "Collection" DROP COLUMN "customerId",
ADD COLUMN     "profileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "minutesReadToday",
DROP COLUMN "monthlyBookGoal",
DROP COLUMN "readingDate",
DROP COLUMN "readingReminderTime",
DROP COLUMN "totalMinutesRead";

-- AlterTable
ALTER TABLE "EBook" ADD COLUMN     "author" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Favorite" DROP COLUMN "customerId",
ADD COLUMN     "profileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ReadingProgress" DROP COLUMN "customerId",
ADD COLUMN     "avgSecondsPerPage" DOUBLE PRECISION,
ADD COLUMN     "lastPageAt" TIMESTAMP(3),
ADD COLUMN     "profileId" TEXT NOT NULL;

-- DropTable
DROP TABLE "ChildProfile";

-- DropTable
DROP TABLE "ChildReadingProgress";

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarEmoji" TEXT NOT NULL DEFAULT '🙂',
    "color" TEXT NOT NULL DEFAULT 'purple',
    "type" TEXT NOT NULL DEFAULT 'adult',
    "pinHash" TEXT,
    "dailyLimitMinutes" INTEGER,
    "minutesReadToday" INTEGER NOT NULL DEFAULT 0,
    "limitResetDate" TEXT,
    "reminderTime" TEXT,
    "monthlyBookGoal" INTEGER,
    "totalMinutesRead" INTEGER NOT NULL DEFAULT 0,
    "readingStreak" INTEGER NOT NULL DEFAULT 0,
    "lastReadDate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_profileId_ebookId_key" ON "Favorite"("profileId", "ebookId");

-- CreateIndex
CREATE UNIQUE INDEX "ReadingProgress_profileId_ebookId_key" ON "ReadingProgress"("profileId", "ebookId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingProgress" ADD CONSTRAINT "ReadingProgress_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

