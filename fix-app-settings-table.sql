-- Fix for missing app_settings table
-- Run this SQL directly in your database

-- Check if table exists and create if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'app_settings' AND table_schema = 'public'
    ) THEN
        -- Create the app_settings table
        CREATE TABLE "app_settings" (
            "id" SERIAL NOT NULL,
            "key" TEXT NOT NULL,
            "value" TEXT,
            "type" TEXT NOT NULL,
            "category" TEXT NOT NULL,
            "label" TEXT NOT NULL,
            "description" TEXT,
            "isRequired" BOOLEAN NOT NULL DEFAULT false,
            "defaultValue" TEXT,
            "validation" TEXT,
            "sortOrder" INTEGER NOT NULL DEFAULT 0,
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            "adminId" INTEGER,

            CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
        );

        -- Create indexes
        CREATE UNIQUE INDEX "app_settings_key_adminId_key" ON "app_settings"("key", "adminId");
        CREATE INDEX "app_settings_category_adminId_idx" ON "app_settings"("category", "adminId");

        -- Add foreign key constraint
        ALTER TABLE "app_settings" ADD CONSTRAINT "app_settings_adminId_fkey" 
        FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

        RAISE NOTICE 'app_settings table created successfully';
    ELSE
        RAISE NOTICE 'app_settings table already exists';
    END IF;
END $$;
