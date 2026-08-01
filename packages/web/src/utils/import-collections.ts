import type { depot } from '@depot/core';
import { calculateCollectionPoints } from '@depot/core/utils/collection';

import { readJsonFile } from '@/utils/file';
import { isExportedCollection } from '@/types/export';

export type ImportCollectionsResult = {
  imported: depot.Collection[];
  failed: Array<{ fileName: string; reason: string }>;
};

export type ImportCollectionsDeps = {
  dataVersion?: string | null;
  saveCollection: (collection: depot.Collection) => Promise<void>;
};

export const remapCollectionIds = (
  collection: depot.Collection,
  dataVersion?: string | null
): depot.Collection => {
  const items = collection.items.map((item) => ({
    ...item,
    id: crypto.randomUUID()
  }));

  return {
    ...collection,
    id: crypto.randomUUID(),
    items,
    dataVersion: dataVersion ?? collection.dataVersion ?? null,
    points: { current: calculateCollectionPoints({ ...collection, items }) }
  };
};

/**
 * Parse and save one or more collection export JSON files.
 * Invalid files are skipped and reported; valid ones are remapped and saved.
 */
export const importCollectionsFromFiles = async (
  files: File[],
  deps: ImportCollectionsDeps
): Promise<ImportCollectionsResult> => {
  const imported: depot.Collection[] = [];
  const failed: Array<{ fileName: string; reason: string }> = [];

  for (const file of files) {
    try {
      const parsed = await readJsonFile<unknown>(file);
      if (!isExportedCollection(parsed) || parsed.version !== 1) {
        failed.push({
          fileName: file.name,
          reason: 'Not a depot collection export'
        });
        continue;
      }

      const collection = remapCollectionIds(parsed.collection, deps.dataVersion);
      await deps.saveCollection(collection);
      imported.push(collection);
    } catch {
      failed.push({
        fileName: file.name,
        reason: 'Could not read or parse file'
      });
    }
  }

  return { imported, failed };
};

const describeImportedCount = (count: number): string =>
  count === 1 ? '1 collection' : `${count} collections`;

export const formatCollectionImportToast = (
  result: ImportCollectionsResult
): { type: 'success' | 'warning' | 'error'; title: string; message: string } => {
  const total = result.imported.length + result.failed.length;

  if (result.imported.length === 0) {
    return {
      type: 'error',
      title: 'Import failed',
      message:
        total === 1
          ? result.failed[0]?.reason ?? 'Could not import this file.'
          : `None of the ${total} files looked like valid exports.`
    };
  }

  if (result.failed.length === 0) {
    return {
      type: 'success',
      title: 'Import complete',
      message: `Imported ${describeImportedCount(result.imported.length)}.`
    };
  }

  return {
    type: 'warning',
    title: 'Import partially complete',
    message: `Imported ${result.imported.length} of ${total} files. ${result.failed.length} skipped.`
  };
};
