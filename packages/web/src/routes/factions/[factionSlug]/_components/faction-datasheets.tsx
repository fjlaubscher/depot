import React from 'react';
import type { DatasheetListItem } from '@/types/datasheets';

// Components
import { DatasheetBrowser } from '@/components/shared/datasheet';
import type { DatasheetFilters } from '@/hooks/use-datasheet-browser';

interface FactionDatasheetsProps {
  datasheets: DatasheetListItem[];
  filters: DatasheetFilters;
}

const FactionDatasheets: React.FC<FactionDatasheetsProps> = ({ datasheets, filters }) => {
  return (
    <div data-testid="faction-datasheets">
      <DatasheetBrowser
        datasheets={datasheets}
        searchPlaceholder="Search datasheets by name..."
        emptyStateMessage="No datasheets found matching your search criteria."
        showItemCount={false}
        filters={filters}
      />
    </div>
  );
};

export default FactionDatasheets;
