-- AlterTable
ALTER TABLE "User" ADD COLUMN "passwordResetExpiry" DATETIME;
ALTER TABLE "User" ADD COLUMN "passwordResetToken" TEXT;
