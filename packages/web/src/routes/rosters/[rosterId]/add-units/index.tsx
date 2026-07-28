import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { RosterProvider } from '@/contexts/roster/context';
import { useRoster } from '@/contexts/roster/use-roster-context';
import { useToast } from '@/contexts/toast/use-toast-context';
import type { SelectedUnit } from '@/hooks/use-roster-unit-selection';
import { useDocumentTitle } from '@/hooks/use-document-title';

import AppLayout from '@/components/layout';
import { Loader } from '@/components/ui';
import { RosterHeader } from '@/components/shared';
import AddUnitsView from '@/components/shared/add-units-view';

const AddRosterUnitsView: FC = () => {
  const { state: roster, addUnit } = useRoster();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const rosterFactionSlug = roster.faction?.slug ?? roster.factionSlug ?? undefined;

  const pageTitle = roster.id ? `${roster.name} - Add Roster Units` : 'Add Roster Units';
  useDocumentTitle(pageTitle);

  if (!roster.id) {
    return <Loader />;
  }

  const factionName = roster.faction?.name;
  const subtitle =
    factionName && roster.detachment?.name
      ? `${factionName} • ${roster.detachment.name}`
      : factionName || roster.factionSlug;

  const handleAddSelectedUnits = (selectedUnits: SelectedUnit[]) => {
    selectedUnits.forEach(({ datasheet, modelCost }) => {
      addUnit(datasheet, modelCost);
    });

    showToast({
      type: 'success',
      title: 'Units Added',
      message: `Added ${selectedUnits.length} unit${
        selectedUnits.length === 1 ? '' : 's'
      } to roster`
    });

    navigate(`/rosters/${roster.id}/edit`);
  };

  return (
    <AddUnitsView
      factionSlug={rosterFactionSlug}
      backTo={`/rosters/${roster.id}/edit`}
      backLabel="Back to Roster"
      backAriaLabel="Back to Edit Roster"
      breadcrumbs={[
        { label: 'Rosters', path: '/rosters' },
        { label: roster.name, path: `/rosters/${roster.id}` },
        { label: 'Edit', path: `/rosters/${roster.id}/edit` },
        { label: 'Add Units', path: `/rosters/${roster.id}/add-units` }
      ]}
      title={roster.name}
      subtitle={subtitle}
      headerStats={<RosterHeader roster={roster} />}
      contextLabel="roster"
      onConfirm={handleAddSelectedUnits}
    />
  );
};

const AddRosterUnitsPage: FC = () => {
  const { rosterId } = useParams<{ rosterId: string }>();

  return (
    <AppLayout title="Add Units to Roster">
      <RosterProvider rosterId={rosterId}>
        <AddRosterUnitsView />
      </RosterProvider>
    </AppLayout>
  );
};

export default AddRosterUnitsPage;
