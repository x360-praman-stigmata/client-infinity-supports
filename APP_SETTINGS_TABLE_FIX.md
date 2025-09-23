# App Settings Table Fix

## Issue
```
The table `public.app_settings` does not exist in the current database.
```

## Quick Fix

### Option 1: Run the automated script
```bash
npm run fix-app-settings
```

### Option 2: Manual SQL execution
Execute the SQL in `fix-app-settings-table.sql` directly in your database.

### Option 3: Prisma migration (if npm/npx available)
```bash
npx prisma migrate deploy
npx prisma generate
```

## What This Fixes
- Creates the missing `app_settings` table
- Adds required indexes and constraints
- Maintains data integrity with foreign key relationships
- Regenerates Prisma client

## Files Created
- `fix-app-settings.js` - Automated Node.js fix script
- `fix-app-settings-table.sql` - Manual SQL script
- Added `fix-app-settings` script to package.json

## Verification
After running the fix, the `/api/settings` endpoint should work without errors.
