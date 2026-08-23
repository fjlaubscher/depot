import { useEffect, useRef, useState, type FC, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from '@/lib/navigation';
import { Save } from 'lucide-react';

import { RosterProvider } from '@/contexts/roster/context';
import { useRoster } from '@/contexts/roster/context';
import { useToast } from '@/contexts/toast/context';
import useFaction from '@/hooks/use-faction';

import AppLayout from '@/components/layout';
import { Loader, Button, Card, Field, Alert } from '@/components/ui';
import { FieldSkeleton } from '@/components/ui/skeleton';
import { RosterHeader } from '@/components/shared';
import { getRosterDetachments, getRosterSubtitle } from '@depot/core/utils/roster';
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

  if (isLoading) {
    return (
      <AppLayout title={pageTitle} back={{ to: '/rosters', label: 'Rosters' }}>
        <Loader />
      </AppLayout>
    );
  }

  const detachments = factionDetachments.filter((item) => selectedDetachments.includes(item.slug));
  const saveDisabled =
    !name.trim() || detachments.length === 0 || maxPoints <= 0 || factionLoading || !!factionError;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saveDisabled) return;

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

  return (
    <AppLayout
      title={pageTitle}
      back={{ to: `/rosters/${roster.id}/edit`, label: roster.name }}
      heading={{ title: 'Roster details', subtitle: getRosterSubtitle(roster) }}
      actions={[
        {
          icon: <Save size={16} />,
          onClick: () => formRef.current?.requestSubmit(),
          ariaLabel: 'Save roster details',
          disabled: saveDisabled
        }
      ]}
    >
      <div className="flex flex-col gap-3">
        <div className="surface-card p-3">
          <RosterHeader roster={roster} />
        </div>

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
                className="input-base"
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
          fullWidth
          onClick={() => navigate(`/rosters/${roster.id}`)}
          data-testid="cancel-roster-details"
        >
          Cancel
        </Button>
      </div>
    </AppLayout>
  );
};

const RosterDetailsPage: FC = () => {
  const { rosterId } = useParams<{ rosterId: string }>();

  return (
    <RosterProvider rosterId={rosterId}>
      <RosterDetailsContent />
    </RosterProvider>
  );
};

export default RosterDetailsPage;
