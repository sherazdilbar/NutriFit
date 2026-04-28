/**
 * Database Restore Script for NutriFit
 * 
 * This script restores the database from a backup file
 * Run: node scripts/restore-database.js <backup-filename>
 * Example: node scripts/restore-database.js nutrifit-backup-2024-04-27_14-30-00.db
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DB_PATH = path.join(__dirname, '../prisma/dev.db');
const BACKUP_DIR = path.join(__dirname, '../backups');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get backup filename from command line argument
const backupFileName = process.argv[2];

if (!backupFileName) {
  console.error('✗ Please provide a backup filename');
  console.log('\nUsage: node scripts/restore-database.js <backup-filename>');
  console.log('\nAvailable backups:');
  
  if (fs.existsSync(BACKUP_DIR)) {
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('nutrifit-backup-') && file.endsWith('.db'))
      .sort()
      .reverse();
    
    if (backups.length === 0) {
      console.log('  No backups found');
    } else {
      backups.forEach(backup => {
        const stats = fs.statSync(path.join(BACKUP_DIR, backup));
        const size = (stats.size / 1024).toFixed(2);
        const date = stats.mtime.toLocaleString();
        console.log(`  - ${backup} (${size} KB, ${date})`);
      });
    }
  } else {
    console.log('  No backups directory found');
  }
  
  process.exit(1);
}

const backupPath = path.join(BACKUP_DIR, backupFileName);

// Check if backup file exists
if (!fs.existsSync(backupPath)) {
  console.error('✗ Backup file not found:', backupPath);
  process.exit(1);
}

// Confirm restoration
console.log('\n⚠️  WARNING: This will replace your current database!');
console.log(`   Current database: ${DB_PATH}`);
console.log(`   Restore from: ${backupFileName}`);

rl.question('\nAre you sure you want to continue? (yes/no): ', (answer) => {
  if (answer.toLowerCase() !== 'yes') {
    console.log('✗ Restore cancelled');
    rl.close();
    process.exit(0);
  }
  
  try {
    // Create a backup of current database before restoring
    if (fs.existsSync(DB_PATH)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('_').split('.')[0];
      const preRestoreBackup = path.join(BACKUP_DIR, `pre-restore-backup-${timestamp}.db`);
      fs.copyFileSync(DB_PATH, preRestoreBackup);
      console.log('✓ Created pre-restore backup');
    }
    
    // Restore from backup
    fs.copyFileSync(backupPath, DB_PATH);
    
    console.log('✓ Database restored successfully!');
    console.log(`  Restored from: ${backupFileName}`);
    
  } catch (error) {
    console.error('✗ Restore failed:', error.message);
    process.exit(1);
  }
  
  rl.close();
});
