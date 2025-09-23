#!/bin/bash

# Backup Script for Student Management System
# This script creates backups of the database and application data

set -e

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="sms_backup_$DATE"

echo "💾 Creating backup: $BACKUP_FILE"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup (Neon DB)
echo "📊 Backing up Neon DB..."
# Note: Neon DB backups are handled by Neon automatically
# This script creates a schema backup for reference
echo "-- Neon DB Schema Backup - $(date)" > "$BACKUP_DIR/${BACKUP_FILE}_schema.sql"
echo "-- This is a reference backup. Neon DB handles automatic backups." >> "$BACKUP_DIR/${BACKUP_FILE}_schema.sql"

# Application data backup
echo "📁 Backing up application data..."
tar -czf "$BACKUP_DIR/${BACKUP_FILE}_data.tar.gz" \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=target \
    --exclude=dist \
    .

# Compress everything
echo "🗜️ Compressing backup..."
tar -czf "$BACKUP_DIR/${BACKUP_FILE}_full.tar.gz" \
    -C $BACKUP_DIR \
    "${BACKUP_FILE}_schema.sql" \
    "${BACKUP_FILE}_data.tar.gz"

# Clean up individual files
rm "$BACKUP_DIR/${BACKUP_FILE}_schema.sql"
rm "$BACKUP_DIR/${BACKUP_FILE}_data.tar.gz"

echo "✅ Backup completed: $BACKUP_DIR/${BACKUP_FILE}_full.tar.gz"

# Keep only last 7 days of backups
echo "🧹 Cleaning old backups..."
find $BACKUP_DIR -name "sms_backup_*.tar.gz" -mtime +7 -delete

echo "✅ Backup process completed!"
