import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { depot } from '@depot/core';
import { ArrowLeft, Eye, Plus } from 'lucide-react';

import { RosterProvider } from '@/contexts/roster/context';
import { useRoster } from '@/contexts/roster/use-roster-context';
import { useAppContext } from '@/contexts/app/use-app-context';
import { useToast } from '@/contexts/toast/use-toast-context';

import AppLayout from '@/components/layout';
import { PageHeader, Loader, Breadcrumbs, Button } from '@/components/ui';
import { RosterHeader, RosterUnitsList } from '@/components/shared/roster';
import { generateRosterMarkdown } from '@/utils/roster';

const RosterView: React.FC = () => {
  const { state: roster, duplicateUnit, removeUnit, updateUnitWargear } = useRoster();
  const { state: appState } = useAppContext();
  const navigate = useNavigate();

  if (!roster.id) {
    return <Loader />;
  }

  const factionName = appState.factionIndex?.find(
    (f: depot.Index) => f.id === roster.factionId
  )?.name;

  const subtitle =
    factionName && roster.detachment?.name
      ? `${factionName} • ${roster.detachment.name}`
      : factionName || roster.factionId;

  const handleViewRoster = () => {
    navigate(`/rosters/${roster.id}`);
  };

  const handleAddUnits = () => {
    navigate(`/rosters/${roster.id}/add-units`);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Mobile Back Button */}
      <div className="md:hidden">
        <Link
          to="/rosters"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors text-sm"
          aria-label="Back to Rosters"
        >
          <ArrowLeft size={16} />
          <span className="font-medium">Rosters</span>
        </Link>
      </div>

      {/* Desktop Breadcrumbs */}
      <div className="hidden md:block">
        <Breadcrumbs
          items={[
            { label: 'Rosters', path: '/rosters' },
            { label: roster.name, path: `/rosters/${roster.id}` }
          ]}
        />
      </div>

      <PageHeader
        title={roster.name}
        subtitle={subtitle}
        stats={<RosterHeader roster={roster} />}
        action={{
          icon: <Eye size={16} />,
          onClick: handleViewRoster,
          ariaLabel: 'View roster'
        }}
      />

      <Button onClick={handleAddUnits} className="w-full flex items-center gap-2">
        <Plus size={16} />
        Add Units to Roster
      </Button>

      <RosterUnitsList
        units={roster.units}
        onRemoveUnit={removeUnit}
        onDuplicateUnit={duplicateUnit}
        onUpdateUnitWargear={updateUnitWargear}
      />
    </div>
  );
};

const RosterPage: React.FC = () => {
  const { rosterId } = useParams<{ rosterId: string }>();

  return (
    <AppLayout title="Roster">
      <RosterProvider rosterId={rosterId}>
        <RosterView />
      </RosterProvider>
    </AppLayout>
  );
};

export default RosterPage;
