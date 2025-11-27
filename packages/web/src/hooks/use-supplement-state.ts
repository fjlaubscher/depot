import { useMemo } from 'react';
import type { DatasheetFilters } from './use-datasheet-browser';
import type { DatasheetListItem } from '@/types/datasheets';
import { filterDatasheetsBySettings } from '@/utils/datasheet-filters';
import {
  CODEX_SLUG,
  buildSupplementLabel,
  deriveSupplementMetadata,
  filterDatasheetsBySupplement,
  getSupplementKey,
  isSupplementEntry,
  normalizeSupplementValue
} from '@/utils/datasheet-supplements';

interface UseSupplementStateArgs<T extends DatasheetListItem> {
  datasheets: T[];
  filters?: DatasheetFilters;
  selectedSupplement: string;
}

export const useSupplementState = <T extends DatasheetListItem>({
  datasheets,
  filters,
  selectedSupplement
}: UseSupplementStateArgs<T>) =>
  useMemo(() => {
    const metadataDatasets = filterDatasheetsBySettings(datasheets, filters);
    const supplementMetadata = deriveSupplementMetadata(metadataDatasets);
    const normalizedSelectedSupplement = normalizeSupplementValue(selectedSupplement || 'all');
    const supplementTabs = supplementMetadata.hasSupplements ? supplementMetadata.options : [];

    const codexDatasheets = supplementMetadata.hasSupplements
      ? datasheets.filter((sheet) => !isSupplementEntry(sheet))
      : [];

    const activeSupplementDatasheets = (() => {
      if (!supplementMetadata.hasSupplements || normalizedSelectedSupplement === 'all') {
        return [];
      }

      if (normalizedSelectedSupplement === CODEX_SLUG) {
        return codexDatasheets;
      }

      return datasheets.filter((sheet) => {
        if (!isSupplementEntry(sheet)) {
          return false;
        }

        return getSupplementKey(sheet) === normalizedSelectedSupplement;
      });
    })();

    const supplementFilteredDatasheets = supplementMetadata.hasSupplements
      ? filterDatasheetsBySupplement(datasheets, selectedSupplement)
      : datasheets;

    const filteredActiveSupplementDatasheets = filterDatasheetsBySettings(
      activeSupplementDatasheets,
      filters
    );

    const filteredCodexDatasheets =
      !supplementMetadata.hasSupplements ||
      normalizedSelectedSupplement === 'all' ||
      normalizedSelectedSupplement === CODEX_SLUG
        ? []
        : filterDatasheetsBySettings(codexDatasheets, filters);

    const selectedSupplementLabel = (() => {
      if (!supplementMetadata.hasSupplements) {
        return null;
      }

      const option = supplementMetadata.options.find(
        (optionItem) => optionItem.value === selectedSupplement
      );

      if (option) {
        return option.label;
      }

      if (selectedSupplement && selectedSupplement !== 'all') {
        return buildSupplementLabel(selectedSupplement);
      }

      return null;
    })();

    const supplementSummary = (() => {
      if (!supplementMetadata.hasSupplements || normalizedSelectedSupplement === 'all') {
        return null;
      }

      if (!selectedSupplementLabel) {
        return null;
      }

      if (normalizedSelectedSupplement === CODEX_SLUG) {
        return `${selectedSupplementLabel} (core datasheets): ${filteredActiveSupplementDatasheets.length} datasheets`;
      }

      const sharedCount = filteredCodexDatasheets.length;
      const primaryCount = filteredActiveSupplementDatasheets.length;

      if (sharedCount === 0) {
        return `${selectedSupplementLabel}: ${primaryCount} datasheets`;
      }

      return `${selectedSupplementLabel}: ${primaryCount} datasheets + ${sharedCount} shared core datasheets`;
    })();

    return {
      supplementMetadata,
      normalizedSelectedSupplement,
      supplementTabs,
      codexDatasheets,
      activeSupplementDatasheets,
      supplementFilteredDatasheets,
      filteredActiveSupplementDatasheets,
      filteredCodexDatasheets,
      selectedSupplementLabel,
      supplementSummary
    };
  }, [datasheets, filters, selectedSupplement]);
