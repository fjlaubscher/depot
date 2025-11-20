#!/usr/bin/env node

import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const sourceDir = 'packages/cli/dist/data';
// Always copy into the production bundle; also copy to public/ for local dev when NODE_ENV is not production.
const targetDirs = ['packages/web/dist/data'];
if (process.env.NODE_ENV !== 'production') {
  targetDirs.push('packages/web/public/data');
}

try {
  if (!existsSync(sourceDir)) {
    console.error(`Source directory not found: ${sourceDir}`);
    console.error('Run "pnpm run data:generate" first to create the data files.');
    process.exit(1);
  }

  const files = readdirSync(sourceDir);

  if (files.length === 0) {
    console.error(`No files found in ${sourceDir}`);
    process.exit(1);
  }

  targetDirs.forEach((targetDir) => {
    mkdirSync(targetDir, { recursive: true });
    console.log(`Copying ${files.length} files from ${sourceDir} to ${targetDir}...`);

    files.forEach((file) => {
      const sourcePath = join(sourceDir, file);
      const targetPath = join(targetDir, file);
      copyFileSync(sourcePath, targetPath);
      console.log(`   copied ${file}`);
    });

    console.log(`Successfully copied all data files to ${targetDir}`);
  });
} catch (error) {
  console.error('Error copying data files:', error);
  process.exit(1);
}
