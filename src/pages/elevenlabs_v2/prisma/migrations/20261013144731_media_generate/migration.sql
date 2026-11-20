-- CreateTable
CREATE TABLE "Voice" (
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

    CONSTRAINT "Voice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stability" DOUBLE PRECISION NOT NULL,
    "similarity_boost" DOUBLE PRECISION NOT NULL,
    "permissions" TEXT[],
    "category" TEXT NOT NULL,
    "fine_tuning_request" TEXT NOT NULL,
    "public_domain" BOOLEAN NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Text" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stability" DOUBLE PRECISION NOT NULL,
    "similarity_boost" DOUBLE PRECISION NOT NULL,
    "permissions" TEXT[],
    "category" TEXT NOT NULL,
    "fine_tuning_request" TEXT NOT NULL,
    "public_domain" BOOLEAN NOT NULL,

    CONSTRAINT "Text_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Audio" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stability" DOUBLE PRECISION NOT NULL,
    "similarity_boost" DOUBLE PRECISION NOT NULL,
    "permissions" TEXT[],
    "category" TEXT NOT NULL,
    "fine_tuning_request" TEXT NOT NULL,
    "public_domain" BOOLEAN NOT NULL,

    CONSTRAINT "Audio_pkey" PRIMARY KEY ("id")
);
