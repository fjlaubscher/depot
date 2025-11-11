import { useEffect, useMemo, useState, type FC, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Eye, List } from 'lucide-react';

import { RosterProvider } from '@/contexts/roster/context';
import { useRoster } from '@/contexts/roster/use-roster-context';
import { useToast } from '@/contexts/toast/use-toast-context';
import useFaction from '@/hooks/use-faction';

import AppLayout from '@/components/layout';
import {
  PageHeader,
  Loader,
  Breadcrumbs,
  Button,
  Card,
  Field,
  SelectField,
  Alert
} from '@/components/ui';
import { FieldSkeleton } from '@/components/ui/skeleton';
import { BackButton, RosterHeader } from '@/components/shared';
import MaxPointsField from '@/routes/rosters/create/_components/max-points-field';

const RosterDetailsContent: FC = () => {
  const { state: roster, updateRosterDetails } = useRoster();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const factionSlug = roster.factionSlug || roster.faction?.slug;
  const { data: faction, loading: factionLoading, error: factionError } = useFaction(factionSlug);

  const [name, setName] = useState('');
  const [selectedDetachment, setSelectedDetachment] = useState('');
  const [maxPoints, setMaxPoints] = useState(2000);

  useEffect(() => {
    if (roster.id) {
      setName(roster.name);
      setSelectedDetachment(roster.detachment?.slug ?? '');
      setMaxPoints(roster.points.max);
    }
  }, [roster.id, roster.name, roster.detachment?.slug, roster.points.max]);

  const detachmentOptions = useMemo(() => {
    const detachments = faction?.detachments ?? [];
    return detachments
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((detachment) => ({
        value: detachment.slug,
        label: detachment.name
      }));
  }, [faction?.detachments]);

  const isLoading = !roster.id || (!faction && factionLoading);

  if (isLoading) {
    return <Loader />;
  }

  const handleViewRoster = () => {
    navigate(`/rosters/${roster.id}`);
  };

  const handleManageUnits = () => {
    navigate(`/rosters/${roster.id}/edit`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please enter a roster name.'
      });
      return;
    }

    if (!selectedDetachment) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please select a detachment.'
      });
      return;
    }

    if (maxPoints <= 0) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Max points must be greater than 0.'
      });
      return;
    }

    const detachment = (faction?.detachments ?? []).find(
      (item) => item.slug === selectedDetachment
    );

    if (!detachment) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Selected detachment could not be found.'
      });
      return;
    }

    updateRosterDetails({
      name: name.trim(),
      detachment,
      maxPoints
    });

    showToast({
      type: 'success',
      title: 'Roster Updated',
      message: 'Roster details have been saved.'
    });
  };

  const subtitle = roster.detachment?.name
    ? `${roster.faction?.name ?? ''} • ${roster.detachment.name}`.trim()
    : (roster.faction?.name ?? '');

  const saveDisabled =
    !name.trim() || !selectedDetachment || maxPoints <= 0 || factionLoading || !!factionError;

  return (
    <div className="flex flex-col gap-4">
      <BackButton to="/rosters" label="Rosters" ariaLabel="Back to Rosters" className="md:hidden" />

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

      <Button
        onClick={handleManageUnits}
        variant="secondary"
        className="flex items-center justify-center gap-2"
        data-testid="manage-units-button"
      >
        <List size={16} />
        Manage Units
      </Button>

      <Card>
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit}
          data-testid="roster-details-form"
        >
          <Field data-testid="roster-name-field">
            <label htmlFor="roster-name" className="block text-sm font-medium text-body">
              Roster Name
            </label>
            <input
              id="roster-name"
              type="text"
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-foreground"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Name your roster"
            />
          </Field>

          {factionLoading ? (
            <FieldSkeleton />
          ) : factionError ? (
            <Alert
              variant="error"
              title="Failed to load detachments"
              data-testid="detachment-error"
            >
              {factionError}
            </Alert>
          ) : detachmentOptions.length > 0 ? (
            <SelectField
              label="Detachment"
              options={detachmentOptions}
              value={selectedDetachment}
              onChange={(event) => setSelectedDetachment(event.target.value)}
              placeholder="Select a detachment"
              required
              data-testid="detachment-select"
            />
          ) : (
            <Alert
              variant="warning"
              title="No detachments available"
              data-testid="detachment-empty"
            >
              No detachments available for this faction.
            </Alert>
          )}

          <MaxPointsField
            value={maxPoints}
            onChange={setMaxPoints}
            data-testid="max-points-field"
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={handleViewRoster}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveDisabled} data-testid="save-roster-details">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const RosterDetailsPage: FC = () => {
  const { rosterId } = useParams<{ rosterId: string }>();

  return (
    <AppLayout title="Edit Roster">
      <RosterProvider rosterId={rosterId}>
        <RosterDetailsContent />
      </RosterProvider>
    </AppLayout>
  );
};

export default RosterDetailsPage;
