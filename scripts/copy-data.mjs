#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync, rmSync, statSync } from 'fs';
import { dirname } from 'path';

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

  const stats = statSync(sourceDir);
  if (!stats.isDirectory()) {
    console.error(`Source path is not a directory: ${sourceDir}`);
    process.exit(1);
  }

  targetDirs.forEach((targetDir) => {
    // Ensure parent exists before copy; cpSync will create the final directory
    mkdirSync(dirname(targetDir), { recursive: true });
    console.log(`Copying data from ${sourceDir} to ${targetDir}...`);

    rmSync(targetDir, { recursive: true, force: true });
    cpSync(sourceDir, targetDir, { recursive: true, force: true });

    console.log(`Successfully copied data to ${targetDir}`);
  });
} catch (error) {
  console.error('Error copying data files:', error);
  process.exit(1);
}
