import type { depot } from '@depot/core';
import i18n from '@/i18n';
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
          reason: i18n.t('import.invalid', { ns: 'collections' })
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
        reason: i18n.t('import.readError', { ns: 'collections' })
      });
    }
  }

  return { imported, failed, summary };
};

export const formatCollectionImportToast = (
  result: ImportCollectionsResult
): { type: 'success' | 'warning' | 'error'; title: string; message: string } => {
  const total = result.imported.length + result.failed.length;

  if (result.imported.length === 0) {
    return {
      type: 'error',
      title: i18n.t('import.failed', { ns: 'collections' }),
      message:
        total === 1
          ? (result.failed[0]?.reason ?? i18n.t('import.fileError', { ns: 'collections' }))
          : i18n.t('import.none', { ns: 'collections', count: total })
    };
  }

  const rebindNote = formatRebindSummaryMessage(result.summary);

  if (result.failed.length === 0) {
    return {
      type: rebindNote ? 'warning' : 'success',
      title: i18n.t('import.complete', { ns: 'collections' }),
      message: [
        i18n.t('import.imported', { ns: 'collections', count: result.imported.length }),
        rebindNote
      ]
        .filter(Boolean)
        .join(' ')
    };
  }

  return {
    type: 'warning',
    title: i18n.t('import.partial', { ns: 'collections' }),
    message: [
      i18n.t('import.skipped', {
        ns: 'collections',
        imported: result.imported.length,
        total,
        count: result.failed.length
      }),
      rebindNote
    ]
      .filter(Boolean)
      .join(' ')
  };
};
