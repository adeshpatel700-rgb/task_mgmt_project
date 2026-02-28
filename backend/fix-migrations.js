const { Client } = require('pg');

async function fixMigrations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check existing migrations
    const checkQuery = 'SELECT * FROM _prisma_migrations ORDER BY started_at';
    const result = await client.query(checkQuery);
    console.log('\n📋 Current migrations:');
    result.rows.forEach(row => {
      console.log(`  - ${row.migration_name} (${row.finished_at ? 'SUCCESS' : 'FAILED'})`);
    });

    // Delete failed migration
    const deleteQuery = `DELETE FROM _prisma_migrations WHERE migration_name = '20260228_init'`;
    const deleteResult = await client.query(deleteQuery);
    console.log(`\n🗑️  Deleted ${deleteResult.rowCount} failed migration(s)`);

    // Check again
    const finalResult = await client.query(checkQuery);
    console.log('\n📋 Migrations after cleanup:');
    finalResult.rows.forEach(row => {
      console.log(`  - ${row.migration_name} (${row.finished_at ? 'SUCCESS' : 'FAILED'})`);
    });

    console.log('\n✅ Database migration table fixed!');
  } catch (error) {
    console.error('❌ Error fixing migrations:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixMigrations();