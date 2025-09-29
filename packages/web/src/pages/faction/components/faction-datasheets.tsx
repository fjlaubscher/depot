import React from 'react';
import type { depot } from '@depot/core';

// Components
import { DatasheetBrowser } from '@/components/shared/datasheet';

// Hooks
import { useAppContext } from '@/contexts/app/use-app-context';

interface FactionDatasheetsProps {
  datasheets: depot.Datasheet[];
}

const FactionDatasheets: React.FC<FactionDatasheetsProps> = ({ datasheets }) => {
  const { state } = useAppContext();
  const { settings } = state;

  const filters = {
    showLegends: settings?.showLegends,
    showForgeWorld: settings?.showForgeWorld
  };

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
