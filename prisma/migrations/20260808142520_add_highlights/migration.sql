-- CreateTable
CREATE TABLE "Highlight" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "ebookId" TEXT NOT NULL,
    "page" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Highlight_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Highlight" ADD CONSTRAINT "Highlight_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Highlight" ADD CONSTRAINT "Highlight_ebookId_fkey" FOREIGN KEY ("ebookId") REFERENCES "EBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;
