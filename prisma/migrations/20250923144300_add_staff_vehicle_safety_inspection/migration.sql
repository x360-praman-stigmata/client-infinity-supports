-- CreateTable
CREATE TABLE "public"."StaffVehicleSafetyInspection" (
    "id" SERIAL NOT NULL,
    "staffId" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "staffSignature" TEXT,
    "staffSignedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffVehicleSafetyInspection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffVehicleSafetyInspection_staffId_key" ON "public"."StaffVehicleSafetyInspection"("staffId");

-- AddForeignKey
ALTER TABLE "public"."StaffVehicleSafetyInspection" ADD CONSTRAINT "StaffVehicleSafetyInspection_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
