const { Client } = require('pg');

async function fixMigrations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check if _prisma_migrations table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '_prisma_migrations'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('⚠️  _prisma_migrations table does not exist yet - will be created by migrate deploy');
      await client.end();
      return;
    }

    // Check existing migrations
    const checkQuery = 'SELECT migration_name, finished_at, started_at FROM _prisma_migrations ORDER BY started_at';
    const result = await client.query(checkQuery);
    console.log('\n📋 Current migrations:');
    if (result.rows.length === 0) {
      console.log('  (none)');
    } else {
      result.rows.forEach(row => {
        console.log(`  - ${row.migration_name} (${row.finished_at ? 'SUCCESS' : 'FAILED at ' + row.started_at})`);
      });
    }

    // Delete any failed migrations
    const deleteQuery = `DELETE FROM _prisma_migrations WHERE finished_at IS NULL OR migration_name LIKE '%init%'`;
    const deleteResult = await client.query(deleteQuery);
    
    if (deleteResult.rowCount > 0) {
      console.log(`\n🗑️  Deleted ${deleteResult.rowCount} failed/init migration(s)`);
    } else {
      console.log(`\n✅ No failed migrations to clean up`);
    }

    // Check again
    const finalResult = await client.query(checkQuery);
    console.log('\n📋 Migrations after cleanup:');
    if (finalResult.rows.length === 0) {
      console.log('  (none - ready for fresh migration)');
    } else {
      finalResult.rows.forEach(row => {
        console.log(`  - ${row.migration_name} (${row.finished_at ? 'SUCCESS' : 'FAILED'})`);
      });
    }

    console.log('\n✅ Database migration table ready!');
  } catch (error) {
    console.error('❌ Error fixing migrations:', error.message);
    console.error('   Full error:', error);
    // Don't exit with error - let migrate deploy try anyway
  } finally {
    await client.end();
  }
}

fixMigrations();