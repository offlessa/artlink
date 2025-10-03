/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `usuarios` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."usuarios" ADD COLUMN     "username" VARCHAR(50) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "public"."usuarios"("username");
