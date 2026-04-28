/**
 * Migration Rollback Script for NutriFit
 * 
 * This script helps rollback Prisma migrations
 * Run: node scripts/migration-rollback.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const MIGRATIONS_DIR = path.join(__dirname, '../prisma/migrations');
const DB_PATH = path.join(__dirname, '../prisma/dev.db');
const BACKUP_DIR = path.join(__dirname, '../backups');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=== NutriFit Migration Rollback Tool ===\n');

// Check if migrations directory exists
if (!fs.existsSync(MIGRATIONS_DIR)) {
  console.error('✗ Migrations directory not found');
  process.exit(1);
}

// Get list of migrations
const migrations = fs.readdirSync(MIGRATIONS_DIR)
  .filter(file => {
    const fullPath = path.join(MIGRATIONS_DIR, file);
    return fs.statSync(fullPath).isDirectory() && file !== 'migration_lock.toml';
  })
  .sort()
  .reverse();

if (migrations.length === 0) {
  console.log('✗ No migrations found');
  process.exit(0);
}

console.log('Available migrations (newest first):\n');
migrations.forEach((migration, index) => {
  console.log(`  ${index + 1}. ${migration}`);
});

console.log('\n⚠️  ROLLBACK OPTIONS:');
console.log('  1. Reset database (removes all data and reapplies migrations)');
console.log('  2. Restore from backup (recommended - preserves data)');
console.log('  3. Cancel');

rl.question('\nSelect option (1-3): ', (option) => {
  if (option === '3') {
    console.log('✗ Rollback cancelled');
    rl.close();
    process.exit(0);
  }
  
  if (option === '1') {
    console.log('\n⚠️  WARNING: This will DELETE ALL DATA and reset the database!');
    rl.question('Type "RESET" to confirm: ', (confirm) => {
      if (confirm !== 'RESET') {
        console.log('✗ Rollback cancelled');
        rl.close();
        process.exit(0);
      }
      
      try {
        // Create backup before reset
        if (fs.existsSync(DB_PATH)) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('_').split('.')[0];
          const backupPath = path.join(BACKUP_DIR, `pre-reset-backup-${timestamp}.db`);
          
          if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
          }
          
          fs.copyFileSync(DB_PATH, backupPath);
          console.log('✓ Created pre-reset backup');
        }
        
        console.log('\nResetting database...');
        execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
        console.log('\n✓ Database reset complete!');
        
      } catch (error) {
        console.error('✗ Reset failed:', error.message);
        process.exit(1);
      }
      
      rl.close();
    });
  } else if (option === '2') {
    // List available backups
    if (!fs.existsSync(BACKUP_DIR)) {
      console.log('✗ No backups directory found');
      console.log('  Run: node scripts/backup-database.js to create a backup first');
      rl.close();
      process.exit(1);
    }
    
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.endsWith('.db'))
      .sort()
      .reverse();
    
    if (backups.length === 0) {
      console.log('✗ No backups found');
      console.log('  Run: node scripts/backup-database.js to create a backup first');
      rl.close();
      process.exit(1);
    }
    
    console.log('\nAvailable backups:\n');
    backups.forEach((backup, index) => {
      const stats = fs.statSync(path.join(BACKUP_DIR, backup));
      const size = (stats.size / 1024).toFixed(2);
      const date = stats.mtime.toLocaleString();
      console.log(`  ${index + 1}. ${backup} (${size} KB, ${date})`);
    });
    
    rl.question('\nSelect backup to restore (1-' + backups.length + '): ', (backupIndex) => {
      const index = parseInt(backupIndex) - 1;
      
      if (isNaN(index) || index < 0 || index >= backups.length) {
        console.log('✗ Invalid selection');
        rl.close();
        process.exit(1);
      }
      
      const selectedBackup = backups[index];
      const backupPath = path.join(BACKUP_DIR, selectedBackup);
      
      try {
        fs.copyFileSync(backupPath, DB_PATH);
        console.log('\n✓ Database restored from backup!');
        console.log(`  Restored: ${selectedBackup}`);
        
      } catch (error) {
        console.error('✗ Restore failed:', error.message);
        process.exit(1);
      }
      
      rl.close();
    });
  } else {
    console.log('✗ Invalid option');
    rl.close();
    process.exit(1);
  }
});
