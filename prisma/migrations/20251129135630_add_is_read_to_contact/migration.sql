/*
  Warnings:

  - The primary key for the `contact` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `contact` DROP PRIMARY KEY,
    ADD COLUMN `isRead` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);
