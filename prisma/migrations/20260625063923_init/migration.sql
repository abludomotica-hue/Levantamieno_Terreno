-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'TECHNICIAN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inspection" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "visitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "customerObjectives" TEXT NOT NULL DEFAULT '[]',
    "propertyType" TEXT NOT NULL DEFAULT 'casa',
    "floors" INTEGER NOT NULL DEFAULT 1,
    "installationType" TEXT NOT NULL DEFAULT 'wifi',
    "internetFiber" BOOLEAN NOT NULL DEFAULT false,
    "internetRouter" BOOLEAN NOT NULL DEFAULT false,
    "internetWifiGood" BOOLEAN NOT NULL DEFAULT false,
    "internetNeedsRepeater" BOOLEAN NOT NULL DEFAULT false,
    "electricNearbyOutlet" BOOLEAN NOT NULL DEFAULT false,
    "electricNeedsPoint" BOOLEAN NOT NULL DEFAULT false,
    "electricNeedsConduit" BOOLEAN NOT NULL DEFAULT false,
    "distanceNvrRouter" DOUBLE PRECISION,
    "distanceCamera1" DOUBLE PRECISION,
    "distanceCamera2" DOUBLE PRECISION,
    "distanceCamera3" DOUBLE PRECISION,
    "distanceCamera4" DOUBLE PRECISION,
    "distanceTotalCable" DOUBLE PRECISION,
    "recordingType" TEXT NOT NULL DEFAULT '[]',
    "recordingDiskSize" TEXT,
    "remoteAccessPlatforms" TEXT NOT NULL DEFAULT '[]',
    "remoteAccessUsers" INTEGER,
    "additionalEquipment" TEXT NOT NULL DEFAULT '[]',
    "additionalEquipmentNotes" TEXT,
    "crossSellItems" TEXT NOT NULL DEFAULT '[]',
    "risksDetected" TEXT NOT NULL DEFAULT '[]',
    "observations" TEXT,
    "recommendedSystem" TEXT,
    "estimatedInstallTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CameraRequirement" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "CameraRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadedPhoto" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadedPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Signature" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "dataUrl" TEXT NOT NULL,
    "signerName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Signature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedReport" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneratedReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Inspection_clientId_idx" ON "Inspection"("clientId");

-- CreateIndex
CREATE INDEX "Inspection_technicianId_idx" ON "Inspection"("technicianId");

-- CreateIndex
CREATE INDEX "Inspection_status_idx" ON "Inspection"("status");

-- CreateIndex
CREATE INDEX "Inspection_visitDate_idx" ON "Inspection"("visitDate");

-- CreateIndex
CREATE INDEX "CameraRequirement_inspectionId_idx" ON "CameraRequirement"("inspectionId");

-- CreateIndex
CREATE INDEX "UploadedPhoto_inspectionId_idx" ON "UploadedPhoto"("inspectionId");

-- CreateIndex
CREATE INDEX "Signature_inspectionId_idx" ON "Signature"("inspectionId");

-- CreateIndex
CREATE INDEX "GeneratedReport_inspectionId_idx" ON "GeneratedReport"("inspectionId");

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CameraRequirement" ADD CONSTRAINT "CameraRequirement_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadedPhoto" ADD CONSTRAINT "UploadedPhoto_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signature" ADD CONSTRAINT "Signature_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedReport" ADD CONSTRAINT "GeneratedReport_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
