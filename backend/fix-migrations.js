require('dotenv').config();
const { Client } = require('pg');

async function fixMigrations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Drop all existing schema objects to ensure clean slate
    console.log('\n🧹 Cleaning up existing schema...');
    
    // Drop tables if they exist (in correct order due to foreign keys)
    await client.query('DROP TABLE IF EXISTS "RefreshToken" CASCADE;');
    await client.query('DROP TABLE IF EXISTS "Task" CASCADE;');
    await client.query('DROP TABLE IF EXISTS "User" CASCADE;');
    console.log('  ✓ Dropped tables');

    // Drop enums if they exist
    await client.query('DROP TYPE IF EXISTS "TaskStatus" CASCADE;');
    console.log('  ✓ Dropped enums');

    // Drop migrations table to reset migration history
    await client.query('DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;');
    console.log('  ✓ Dropped migration history');

    console.log('\n✅ Database is clean and ready for fresh migrations!');
  } catch (error) {
    console.error('❌ Error cleaning database:', error.message);
    console.error('   Full error:', error);
    // Don't exit with error - let migrate deploy try anyway
  } finally {
    await client.end();
  }
}

fixMigrations();