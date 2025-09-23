const { PrismaClient } = require('@prisma/client');

async function fixAppSettings() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Checking app_settings table...');
    
    // Try to run a simple query to check if table exists
    try {
      await prisma.$queryRaw`SELECT 1 FROM "app_settings" LIMIT 1`;
      console.log('✅ app_settings table exists');
    } catch (error) {
      if (error.code === 'P2021') {
        console.log('❌ app_settings table missing. Creating...');
        
        // Create the table using raw SQL
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "app_settings" (
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
          )
        `;
        
        // Create indexes
        await prisma.$executeRaw`
          CREATE UNIQUE INDEX IF NOT EXISTS "app_settings_key_adminId_key" 
          ON "app_settings"("key", "adminId")
        `;
        
        await prisma.$executeRaw`
          CREATE INDEX IF NOT EXISTS "app_settings_category_adminId_idx" 
          ON "app_settings"("category", "adminId")
        `;
        
        // Add foreign key constraint
        await prisma.$executeRaw`
          ALTER TABLE "app_settings" 
          ADD CONSTRAINT "app_settings_adminId_fkey" 
          FOREIGN KEY ("adminId") REFERENCES "Admin"("id") 
          ON DELETE SET NULL ON UPDATE CASCADE
        `;
        
        console.log('✅ app_settings table created successfully');
      } else {
        throw error;
      }
    }
    
    // Regenerate Prisma client
    console.log('🔄 Regenerating Prisma client...');
    const { exec } = require('child_process');
    exec('npx prisma generate', (error, stdout, stderr) => {
      if (error) {
        console.log('⚠️  Manual Prisma generate needed: npx prisma generate');
      } else {
        console.log('✅ Prisma client regenerated');
      }
    });
    
  } catch (error) {
    console.error('❌ Error fixing app_settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAppSettings();
