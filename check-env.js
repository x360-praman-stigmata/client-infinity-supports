// Simple environment check
require('dotenv').config();

console.log('🔍 Environment Check:');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL format:', process.env.DATABASE_URL ? 'Valid format' : 'Missing');

if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log('✅ Database URL parsed successfully:');
    console.log('  Protocol:', url.protocol);
    console.log('  Host:', url.hostname);
    console.log('  Port:', url.port || '5432');
    console.log('  Database:', url.pathname.slice(1));
    console.log('  SSL Mode:', url.searchParams.get('sslmode') || 'not specified');
  } catch (error) {
    console.error('❌ Invalid DATABASE_URL format:', error.message);
  }
}

console.log('\n🔍 Other Environment Variables:');
console.log('NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET);
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'not set');
