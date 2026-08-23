import type { FC } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from '@/lib/navigation';

import { RosterProvider } from '@/contexts/roster/context';
import { useRoster } from '@/contexts/roster/context';
import { useToast } from '@/contexts/toast/context';
import type { SelectedUnit } from '@/hooks/use-roster-unit-selection';

import AppLayout from '@/components/layout';
import { Loader } from '@/components/ui';
import { RosterHeader } from '@/components/shared';
import AddUnitsView from '@/components/shared/add-units-view';
import { getRosterSubtitle } from '@depot/core/utils/roster';

const AddRosterUnitsView: FC = () => {
  const { state: roster, addUnit } = useRoster();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const rosterFactionSlug = roster.faction?.slug ?? roster.factionSlug ?? undefined;

  const pageTitle = roster.id ? `${roster.name} - Add Roster Units` : 'Add Roster Units';

  if (!roster.id) {
    return (
      <AppLayout title={pageTitle} back={{ to: '/rosters', label: 'Rosters' }}>
        <Loader />
      </AppLayout>
    );
  }

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
      backLabel={roster.name}
      documentTitle={pageTitle}
      title="Add units"
      subtitle={`${roster.name} · ${getRosterSubtitle(roster)}`}
      headerStats={<RosterHeader roster={roster} />}
      onConfirm={handleAddSelectedUnits}
    />
  );
};

const AddRosterUnitsPage: FC = () => {
  const { rosterId } = useParams<{ rosterId: string }>();

  return (
    <RosterProvider rosterId={rosterId}>
      <AddRosterUnitsView />
    </RosterProvider>
  );
};

export default AddRosterUnitsPage;
