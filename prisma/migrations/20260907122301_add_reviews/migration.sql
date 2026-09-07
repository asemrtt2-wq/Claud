-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "ebookId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "rating" INTEGER,
    "comment" TEXT NOT NULL DEFAULT '',
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_ebookId_createdAt_idx" ON "Review"("ebookId", "createdAt");

-- CreateIndex
CREATE INDEX "Review_parentId_idx" ON "Review"("parentId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_ebookId_fkey" FOREIGN KEY ("ebookId") REFERENCES "EBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
