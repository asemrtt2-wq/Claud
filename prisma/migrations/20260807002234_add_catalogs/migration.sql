-- CreateTable
CREATE TABLE "Catalog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CatalogToEBook" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Catalog_name_key" ON "Catalog"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_CatalogToEBook_AB_unique" ON "_CatalogToEBook"("A", "B");

-- CreateIndex
CREATE INDEX "_CatalogToEBook_B_index" ON "_CatalogToEBook"("B");

-- AddForeignKey
ALTER TABLE "_CatalogToEBook" ADD CONSTRAINT "_CatalogToEBook_A_fkey" FOREIGN KEY ("A") REFERENCES "Catalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CatalogToEBook" ADD CONSTRAINT "_CatalogToEBook_B_fkey" FOREIGN KEY ("B") REFERENCES "EBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;
