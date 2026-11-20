/*
  Warnings:

  - You are about to drop the `Audio` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Text` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Voice` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Audio";

-- DropTable
DROP TABLE "Project";

-- DropTable
DROP TABLE "Text";

-- DropTable
DROP TABLE "Voice";

-- CreateTable
CREATE TABLE "voice" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "description" TEXT,
    "stability" DOUBLE PRECISION NOT NULL,
    "similarity_boost" DOUBLE PRECISION NOT NULL,
    "permissions" TEXT[],
    "category" TEXT NOT NULL,
    "fine_tuning_request" TEXT NOT NULL,
    "public_domain" BOOLEAN NOT NULL,

    CONSTRAINT "voice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stability" DOUBLE PRECISION NOT NULL,
    "similarity_boost" DOUBLE PRECISION NOT NULL,
    "permissions" TEXT[],
    "category" TEXT NOT NULL,
    "fine_tuning_request" TEXT NOT NULL,
    "public_domain" BOOLEAN NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "text" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stability" DOUBLE PRECISION NOT NULL,
    "similarity_boost" DOUBLE PRECISION NOT NULL,
    "permissions" TEXT[],
    "category" TEXT NOT NULL,
    "fine_tuning_request" TEXT NOT NULL,
    "public_domain" BOOLEAN NOT NULL,

    CONSTRAINT "text_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audio" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stability" DOUBLE PRECISION NOT NULL,
    "similarity_boost" DOUBLE PRECISION NOT NULL,
    "permissions" TEXT[],
    "category" TEXT NOT NULL,
    "fine_tuning_request" TEXT NOT NULL,
    "public_domain" BOOLEAN NOT NULL,

    CONSTRAINT "audio_pkey" PRIMARY KEY ("id")
);
