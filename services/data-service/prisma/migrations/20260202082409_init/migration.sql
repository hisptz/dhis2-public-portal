-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('QUEUED', 'PROCESSING', 'FAILED', 'PROCESSED');

-- CreateEnum
CREATE TYPE "ProcessStatus" AS ENUM ('QUEUED', 'INIT', 'FAILED', 'DONE');

-- CreateEnum
CREATE TYPE "UploadStrategy" AS ENUM ('CREATE_AND_UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "MetadataDownloadType" AS ENUM ('VISUALIZATION', 'MAP', 'DASHBOARD');

-- CreateEnum
CREATE TYPE "MetadataSourceType" AS ENUM ('SOURCE_INSTANCE', 'FLEXIPORTAL_CONFIG');

-- CreateTable
CREATE TABLE "DataRun" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "RunStatus" NOT NULL DEFAULT 'QUEUED',
    "periods" TEXT[],
    "timeout" INTEGER,
    "parentOrgUnit" TEXT,
    "orgUnitLevel" INTEGER,
    "configIds" TEXT[],
    "mainConfigId" TEXT NOT NULL,
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,

    CONSTRAINT "DataRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataDownload" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "runId" INTEGER NOT NULL,
    "dimensions" JSONB NOT NULL,
    "filters" JSONB,
    "configId" TEXT NOT NULL,
    "status" "ProcessStatus" NOT NULL DEFAULT 'QUEUED',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "count" INTEGER,
    "error" TEXT,
    "errorObject" JSONB,

    CONSTRAINT "DataDownload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataUpload" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "runId" INTEGER NOT NULL,
    "strategy" "UploadStrategy" NOT NULL DEFAULT 'CREATE_AND_UPDATE',
    "dataDownloadId" INTEGER NOT NULL,
    "status" "ProcessStatus" NOT NULL DEFAULT 'QUEUED',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "count" INTEGER,
    "imported" INTEGER,
    "ignored" INTEGER,
    "updated" INTEGER,
    "error" TEXT,
    "errorObject" JSONB,

    CONSTRAINT "DataUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetadataRun" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "status" "RunStatus" NOT NULL DEFAULT 'QUEUED',
    "mainConfigId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceType" "MetadataSourceType" NOT NULL,
    "visualizations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dashboards" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "maps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "error" TEXT,

    CONSTRAINT "MetadataRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetadataDownload" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "type" "MetadataDownloadType" NOT NULL,
    "items" TEXT[],
    "runId" INTEGER NOT NULL,
    "status" "ProcessStatus" NOT NULL DEFAULT 'QUEUED',
    "error" TEXT,
    "errorObject" JSONB,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "MetadataDownload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetadataUpload" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "runId" INTEGER NOT NULL,
    "downloadId" INTEGER NOT NULL,
    "summary" JSONB,
    "status" "ProcessStatus" NOT NULL DEFAULT 'QUEUED',
    "error" TEXT,
    "errorObject" JSONB,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "MetadataUpload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DataRun_uid_key" ON "DataRun"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "DataDownload_uid_key" ON "DataDownload"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "DataUpload_uid_key" ON "DataUpload"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "MetadataRun_uid_key" ON "MetadataRun"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "MetadataDownload_uid_key" ON "MetadataDownload"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "MetadataUpload_uid_key" ON "MetadataUpload"("uid");

-- AddForeignKey
ALTER TABLE "DataDownload" ADD CONSTRAINT "DataDownload_runId_fkey" FOREIGN KEY ("runId") REFERENCES "DataRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataUpload" ADD CONSTRAINT "DataUpload_runId_fkey" FOREIGN KEY ("runId") REFERENCES "DataRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataUpload" ADD CONSTRAINT "DataUpload_dataDownloadId_fkey" FOREIGN KEY ("dataDownloadId") REFERENCES "DataDownload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetadataDownload" ADD CONSTRAINT "MetadataDownload_runId_fkey" FOREIGN KEY ("runId") REFERENCES "MetadataRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetadataUpload" ADD CONSTRAINT "MetadataUpload_runId_fkey" FOREIGN KEY ("runId") REFERENCES "MetadataRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetadataUpload" ADD CONSTRAINT "MetadataUpload_downloadId_fkey" FOREIGN KEY ("downloadId") REFERENCES "MetadataDownload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
