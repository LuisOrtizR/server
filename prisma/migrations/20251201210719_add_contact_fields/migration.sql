/*
  Warnings:

  - Added the required column `updatedAt` to the `Contact` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Contact` ADD COLUMN `starred` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE INDEX `Contact_isRead_idx` ON `Contact`(`isRead`);

-- CreateIndex
CREATE INDEX `Contact_starred_idx` ON `Contact`(`starred`);

-- CreateIndex
CREATE INDEX `Contact_createdAt_idx` ON `Contact`(`createdAt`);
