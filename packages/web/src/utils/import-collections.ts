import type { depot } from '@depot/core';
import { calculateCollectionPoints } from '@depot/core/utils/collection';

import { readJsonFile } from '@/utils/file';
import { isExportedCollection } from '@/types/export';
import {
  formatRebindSummaryMessage,
  refreshCollectionDataWithReport,
  type RebindSummary,
  type RefreshCollectionParams
} from '@/utils/refresh-user-data';

export type ImportCollectionsResult = {
  imported: depot.Collection[];
  failed: Array<{ fileName: string; reason: string }>;
  /** Rebind outcome across every imported unit (only populated when migrated to current data). */
  summary: RebindSummary;
};

export type ImportCollectionsDeps = {
  dataVersion?: string | null;
  saveCollection: (collection: depot.Collection) => Promise<void>;
  /** When provided with `dataVersion`, imported units are rebound to the current catalog. */
  getDatasheet?: RefreshCollectionParams['getDatasheet'];
  getFactionManifest?: RefreshCollectionParams['getFactionManifest'];
};

export const remapCollectionIds = (collection: depot.Collection): depot.Collection => {
  const items = collection.items.map((item) => ({
    ...item,
    id: crypto.randomUUID()
  }));

  return {
    ...collection,
    id: crypto.randomUUID(),
    items,
    dataVersion: collection.dataVersion ?? null,
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
  const summary: RebindSummary = { ok: 0, partial: 0, missing: 0 };

  for (const file of files) {
    try {
      const parsed = await readJsonFile<unknown>(file);
      if (!isExportedCollection(parsed)) {
        failed.push({
          fileName: file.name,
          reason: 'Not a depot collection export'
        });
        continue;
      }

      let collection = remapCollectionIds(parsed.collection);
      // Migrate legacy exports onto the current catalog (10th → 11th rebinds by id/slug/name).
      if (deps.getDatasheet && deps.dataVersion && collection.dataVersion !== deps.dataVersion) {
        const result = await refreshCollectionDataWithReport({
          collection,
          currentDataVersion: deps.dataVersion,
          getDatasheet: deps.getDatasheet,
          getFactionManifest: deps.getFactionManifest
        });
        collection = result.collection;
        summary.ok += result.summary.ok;
        summary.partial += result.summary.partial;
        summary.missing += result.summary.missing;
      }
      await deps.saveCollection(collection);
      imported.push(collection);
    } catch {
      failed.push({
        fileName: file.name,
        reason: 'Could not read or parse file'
      });
    }
  }

  return { imported, failed, summary };
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
          ? (result.failed[0]?.reason ?? 'Could not import this file.')
          : `None of the ${total} files looked like valid exports.`
    };
  }

  const rebindNote = formatRebindSummaryMessage(result.summary);

  if (result.failed.length === 0) {
    return {
      type: rebindNote ? 'warning' : 'success',
      title: 'Import complete',
      message: [`Imported ${describeImportedCount(result.imported.length)}.`, rebindNote]
        .filter(Boolean)
        .join(' ')
    };
  }

  return {
    type: 'warning',
    title: 'Import partially complete',
    message: [
      `Imported ${result.imported.length} of ${total} files. ${result.failed.length} skipped.`,
      rebindNote
    ]
      .filter(Boolean)
      .join(' ')
  };
};
