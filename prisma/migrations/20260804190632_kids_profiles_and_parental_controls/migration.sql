-- AlterTable
ALTER TABLE "Customer" ADD COLUMN "readingReminderTime" TEXT;

-- CreateTable
CREATE TABLE "ChildProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarEmoji" TEXT NOT NULL DEFAULT '🧒',
    "dailyLimitMinutes" INTEGER,
    "minutesReadToday" INTEGER NOT NULL DEFAULT 0,
    "limitResetDate" TEXT,
    "reminderTime" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChildProfile_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChildReadingProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "childProfileId" TEXT NOT NULL,
    "ebookId" TEXT NOT NULL,
    "page" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "lastPageAt" DATETIME,
    "avgSecondsPerPage" REAL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ChildReadingProgress_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChildReadingProgress_ebookId_fkey" FOREIGN KEY ("ebookId") REFERENCES "EBook" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EBook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL,
    "audience" TEXT NOT NULL DEFAULT 'adults',
    "coverEmoji" TEXT NOT NULL,
    "coverTheme" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "oldPrice" REAL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_EBook" ("category", "content", "coverEmoji", "coverTheme", "createdAt", "description", "featured", "id", "oldPrice", "price", "slug", "subtitle", "title", "updatedAt") SELECT "category", "content", "coverEmoji", "coverTheme", "createdAt", "description", "featured", "id", "oldPrice", "price", "slug", "subtitle", "title", "updatedAt" FROM "EBook";
DROP TABLE "EBook";
ALTER TABLE "new_EBook" RENAME TO "EBook";
CREATE UNIQUE INDEX "EBook_slug_key" ON "EBook"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ChildReadingProgress_childProfileId_ebookId_key" ON "ChildReadingProgress"("childProfileId", "ebookId");
