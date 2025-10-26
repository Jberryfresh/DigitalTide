#!/usr/bin/env node
/**
 * Database Setup Verification Script
 * Checks if database is properly configured and running
 */

import { testConnection, query, closePool } from './src/database/pool.js';

console.log('🔍 DigitalTide Database Verification');
console.log('====================================\n');

async function verify() {
  let exitCode = 0;

  try {
    // 1. Test database connection
    console.log('1️⃣  Testing database connection...');
    await testConnection();
    
    // 2. Check if migrations have been run
    console.log('\n2️⃣  Checking migration status...');
    try {
      const result = await query('SELECT COUNT(*) FROM schema_migrations');
      const count = parseInt(result.rows[0].count);
      if (count > 0) {
        console.log(`   ✅ Found ${count} applied migration(s)`);
        
        const migrations = await query('SELECT version, name, applied_at FROM schema_migrations ORDER BY version');
        migrations.rows.forEach(m => {
          console.log(`      - Version ${m.version}: ${m.name} (${new Date(m.applied_at).toLocaleString()})`);
        });
      } else {
        console.log('   ⚠️  No migrations found. Run: npm run db:migrate');
        exitCode = 1;
      }
    } catch (error) {
      if (error.code === '42P01') {
        console.log('   ⚠️  schema_migrations table not found. Run: npm run db:migrate');
        exitCode = 1;
      } else {
        throw error;
      }
    }

    // 3. Check table existence
    console.log('\n3️⃣  Checking core tables...');
    const tables = [
      'users', 'articles', 'categories', 'tags', 'sources',
      'agent_tasks', 'analytics_events', 'reading_list', 'refresh_tokens'
    ];
    
    for (const table of tables) {
      try {
        const result = await query(`SELECT COUNT(*) FROM ${table}`);
        const count = parseInt(result.rows[0].count);
        console.log(`   ✅ ${table}: ${count} record(s)`);
      } catch (error) {
        if (error.code === '42P01') {
          console.log(`   ❌ ${table}: Table not found`);
          exitCode = 1;
        } else {
          throw error;
        }
      }
    }

    // 4. Check indexes
    console.log('\n4️⃣  Checking indexes...');
    const indexQuery = `
      SELECT 
        schemaname,
        tablename,
        indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `;
    const indexResult = await query(indexQuery);
    console.log(`   ✅ Found ${indexResult.rows.length} indexes`);

    // 5. Database statistics
    console.log('\n5️⃣  Database statistics:');
    const dbSize = await query("SELECT pg_size_pretty(pg_database_size(current_database())) as size");
    console.log(`   📊 Database size: ${dbSize.rows[0].size}`);
    
    const connCount = await query("SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()");
    console.log(`   🔌 Active connections: ${connCount.rows[0].count}`);

    // 6. Connection pool status
    console.log('\n6️⃣  Connection pool status:');
    console.log(`   ℹ️  Total pool size: 20 max`);
    console.log(`   ℹ️  Idle timeout: 30 seconds`);
    console.log(`   ℹ️  Connection timeout: 2 seconds`);

    // Summary
    console.log('\n====================================');
    if (exitCode === 0) {
      console.log('✨ Database verification complete! All checks passed.\n');
      console.log('📝 Next steps:');
      console.log('   1. Start services: npm run docker:up');
      console.log('   2. Run migrations: npm run db:migrate');
      console.log('   3. Load seed data: npm run db:seed');
      console.log('   4. Start server: npm run dev\n');
    } else {
      console.log('⚠️  Some checks failed. Please review the output above.\n');
      console.log('💡 Try running:');
      console.log('   npm run docker:up    # Start database services');
      console.log('   npm run db:migrate   # Run migrations');
      console.log('   npm run db:seed      # Load seed data\n');
    }

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Make sure Docker is running');
    console.error('   2. Start services: npm run docker:up');
    console.error('   3. Wait a few seconds for PostgreSQL to be ready');
    console.error('   4. Check your .env file has correct DATABASE_URL\n');
    exitCode = 1;
  } finally {
    await closePool();
    process.exit(exitCode);
  }
}

verify();
