import { useEffect, useRef, useState, type FC, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('common');
  const { t: rosterT } = useTranslation('rosters');
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

  const pageTitle = roster.name
    ? rosterT('pages.detailsTitle', { name: roster.name })
    : rosterT('pages.detailsDocument');

  if (isLoading) {
    return (
      <AppLayout title={pageTitle} back={{ to: '/rosters', label: t('navigation.rosters') }}>
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
      title: rosterT('notifications.detailsUpdated'),
      message: rosterT('notifications.detailsSaved')
    });

    navigate(`/rosters/${roster.id}/edit`);
  };

  return (
    <AppLayout
      title={pageTitle}
      back={{ to: `/rosters/${roster.id}/edit`, label: roster.name }}
      heading={{ title: rosterT('pages.details'), subtitle: getRosterSubtitle(roster) }}
      actions={[
        {
          icon: <Save size={16} />,
          onClick: () => formRef.current?.requestSubmit(),
          ariaLabel: rosterT('form.save'),
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
                {rosterT('form.name')}
              </label>
              <input
                id="roster-name"
                type="text"
                className="input-base"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={rosterT('form.namePlaceholder')}
              />
            </Field>

            {factionLoading ? (
              <FieldSkeleton />
            ) : factionError ? (
              <Alert
                variant="error"
                title={rosterT('form.detachmentsError')}
                data-testid="detachment-error"
              >
                {rosterT('form.loadError')}
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
                title={rosterT('form.noDetachmentsTitle')}
                data-testid="detachment-empty"
              >
                {rosterT('form.noDetachments')}.
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
          {t('actions.cancel')}
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
