-- CreateTable
CREATE TABLE "BookRequest" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "profileId" TEXT,
    "topic" TEXT NOT NULL,
    "details" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "draft" TEXT,
    "error" TEXT,
    "ebookId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookRequest_customerId_createdAt_idx" ON "BookRequest"("customerId", "createdAt");

-- AddForeignKey
ALTER TABLE "BookRequest" ADD CONSTRAINT "BookRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookRequest" ADD CONSTRAINT "BookRequest_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
