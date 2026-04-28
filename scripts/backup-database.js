/**
 * Database Backup Script for NutriFit
 * 
 * This script creates a backup of the SQLite database with timestamp
 * Run: node scripts/backup-database.js
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../prisma/dev.db');
const BACKUP_DIR = path.join(__dirname, '../backups');

// Create backups directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log('✓ Created backups directory');
}

// Generate timestamp for backup filename
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('_').split('.')[0];
const backupFileName = `nutrifit-backup-${timestamp}.db`;
const backupPath = path.join(BACKUP_DIR, backupFileName);

try {
  // Check if database exists
  if (!fs.existsSync(DB_PATH)) {
    console.error('✗ Database file not found at:', DB_PATH);
    process.exit(1);
  }

  // Copy database file
  fs.copyFileSync(DB_PATH, backupPath);
  
  // Get file size
  const stats = fs.statSync(backupPath);
  const fileSizeInBytes = stats.size;
  const fileSizeInKB = (fileSizeInBytes / 1024).toFixed(2);
  
  console.log('✓ Database backup created successfully!');
  console.log(`  File: ${backupFileName}`);
  console.log(`  Size: ${fileSizeInKB} KB`);
  console.log(`  Path: ${backupPath}`);
  
  // Clean up old backups (keep last 10)
  const backupFiles = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.startsWith('nutrifit-backup-') && file.endsWith('.db'))
    .map(file => ({
      name: file,
      path: path.join(BACKUP_DIR, file),
      time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);
  
  if (backupFiles.length > 10) {
    const filesToDelete = backupFiles.slice(10);
    filesToDelete.forEach(file => {
      fs.unlinkSync(file.path);
      console.log(`✓ Removed old backup: ${file.name}`);
    });
  }
  
  console.log(`\n✓ Total backups: ${Math.min(backupFiles.length, 10)}`);
  
} catch (error) {
  console.error('✗ Backup failed:', error.message);
  process.exit(1);
}
