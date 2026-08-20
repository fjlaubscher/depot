import { useEffect, useRef, useState, type FC, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';

import { RosterProvider } from '@/contexts/roster/context';
import { useRoster } from '@/contexts/roster/use-roster-context';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useToast } from '@/contexts/toast/use-toast-context';
import useFaction from '@/hooks/use-faction';

import AppLayout from '@/components/layout';
import { PageHeader, Loader, Breadcrumbs, Button, Card, Field, Alert } from '@/components/ui';
import { FieldSkeleton } from '@/components/ui/skeleton';
import { BackButton, RosterHeader } from '@/components/shared';
import { getRosterDetachments, getRosterDetachmentNames } from '@depot/core/utils/roster';
import MaxPointsField from '@/routes/rosters/_components/max-points-field';
import DetachmentPicker from '@/routes/rosters/_components/detachment-picker';

const RosterDetailsContent: FC = () => {
  const { state: roster, updateRosterDetails } = useRoster();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const factionSlug = roster.factionSlug || roster.faction?.slug;
  const { data: faction, loading: factionLoading, error: factionError } = useFaction(factionSlug);

  const [name, setName] = useState('');
  const [selectedDetachments, setSelectedDetachments] = useState<string[]>([]);
  const [maxPoints, setMaxPoints] = useState(2000);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (roster.id) {
      setName(roster.name);
      setSelectedDetachments(getRosterDetachments(roster).map((detachment) => detachment.slug));
      setMaxPoints(roster.points.max);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roster.id, roster.name, roster.detachments, roster.points.max]);

  const factionDetachments = faction?.detachments ?? [];

  const isLoading = !roster.id || (!faction && factionLoading);

  const pageTitle = roster.name ? `${roster.name} - Roster Details` : 'Roster Details';
  useDocumentTitle(pageTitle);

  if (isLoading) {
    return <Loader />;
  }

  const handleViewRoster = () => {
    navigate(`/rosters/${roster.id}`);
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

    if (selectedDetachments.length === 0) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please select at least one detachment.'
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

    const detachments = factionDetachments.filter((item) =>
      selectedDetachments.includes(item.slug)
    );

    if (detachments.length === 0) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Selected detachments could not be found.'
      });
      return;
    }

    updateRosterDetails({
      name: name.trim(),
      detachments,
      maxPoints
    });

    showToast({
      type: 'success',
      title: 'Roster Updated',
      message: 'Roster details have been saved.'
    });

    navigate(`/rosters/${roster.id}/edit`);
  };

  const detachmentNames = getRosterDetachmentNames(roster);
  const subtitle = detachmentNames
    ? `${roster.faction?.name ?? ''} • ${detachmentNames}`.trim()
    : (roster.faction?.name ?? '');

  const saveDisabled =
    !name.trim() ||
    selectedDetachments.length === 0 ||
    maxPoints <= 0 ||
    factionLoading ||
    !!factionError;

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
          icon: <Save size={16} />,
          onClick: () => formRef.current?.requestSubmit(),
          ariaLabel: 'Save roster details',
          disabled: saveDisabled
        }}
      />

      <Card>
        <form
          ref={formRef}
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
          ) : factionDetachments.length > 0 ? (
            <DetachmentPicker
              data-testid="detachment-select"
              detachments={factionDetachments}
              selectedSlugs={selectedDetachments}
              maxPoints={maxPoints}
              onChange={setSelectedDetachments}
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
        </form>
      </Card>

      <Button
        type="button"
        variant="secondary"
        onClick={handleViewRoster}
        className="flex items-center justify-center gap-2"
        data-testid="cancel-roster-details"
      >
        Cancel
      </Button>
    </div>
  );
};

const RosterDetailsPage: FC = () => {
  const { rosterId } = useParams<{ rosterId: string }>();

  return (
    <AppLayout title="Roster Details">
      <RosterProvider rosterId={rosterId}>
        <RosterDetailsContent />
      </RosterProvider>
    </AppLayout>
  );
};

export default RosterDetailsPage;
