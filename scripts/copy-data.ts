#!/usr/bin/env node

import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const sourceDir = 'packages/cli/dist/data';
const targetDir = 'packages/web/public/data';

try {
  // Check if source directory exists
  if (!existsSync(sourceDir)) {
    console.error(`❌ Source directory not found: ${sourceDir}`);
    console.error('Run "pnpm run data:generate" first to create the data files.');
    process.exit(1);
  }

  // Create target directory if it doesn't exist
  mkdirSync(targetDir, { recursive: true });

  // Copy all files from source to target
  const files = readdirSync(sourceDir);
  
  if (files.length === 0) {
    console.error(`❌ No files found in ${sourceDir}`);
    process.exit(1);
  }

  console.log(`📁 Copying ${files.length} files from ${sourceDir} to ${targetDir}...`);
  
  files.forEach(file => {
    const sourcePath = join(sourceDir, file);
    const targetPath = join(targetDir, file);
    copyFileSync(sourcePath, targetPath);
    console.log(`   ✅ ${file}`);
  });

  console.log(`🎉 Successfully copied all data files to ${targetDir}`);
} catch (error) {
  console.error('❌ Error copying data files:', error);
  process.exit(1);
}