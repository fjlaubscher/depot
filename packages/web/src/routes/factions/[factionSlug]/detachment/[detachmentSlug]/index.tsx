import type { FC } from 'react';
import { useParams } from 'react-router-dom';

// components
import AppLayout from '@/components/layout';
import { ErrorState, Grid, PageHeaderSkeleton, SectionHeader, SkeletonCard } from '@/components/ui';
import { DetachmentAbilityCard, EnhancementCard, StratagemCard } from '@/components/shared';
import { DetachmentMeta } from '../../_components/faction-detachments';
import RulesLink from '@/components/shared/rules-link';

// hooks
import useFaction from '@/hooks/use-faction';
import { useShareAction } from '@/hooks/use-share-action';
import { useBookmarkAction } from '@/hooks/use-bookmark-action';

// utils
import { buildAbsoluteUrl } from '@/utils/paths';
import { createDetachmentBookmark } from '@/utils/bookmarks';
import { matchDetachment } from '@depot/core/utils/detachments';

const Section: FC<{
  title: string;
  testId: string;
  count?: number;
  children: React.ReactNode;
}> = ({ title, testId, count, children }) => (
  <section className="flex flex-col gap-2" data-testid={testId}>
    <SectionHeader title={title} count={count} />
    {children}
  </section>
);

const DetachmentPage: FC = () => {
  const { factionSlug, detachmentSlug } = useParams<{
    factionSlug: string;
    detachmentSlug: string;
  }>();
  const { data: faction, loading, error } = useFaction(factionSlug);

  const detachment = faction
    ? matchDetachment({ slug: detachmentSlug }, faction.detachments)
    : undefined;

  const bookmarkAction = useBookmarkAction(
    faction && detachment ? createDetachmentBookmark(faction, detachment) : undefined
  );

  const shareAction = useShareAction({
    title: detachment?.name,
    url:
      faction && detachment
        ? buildAbsoluteUrl(`/faction/${faction.slug}/detachment/${detachment.slug}`)
        : undefined,
    ariaLabel: 'Share detachment link',
    testId: 'share-detachment',
    copySuccessMessage: 'Detachment link copied to clipboard.',
    shareSuccessMessage: 'Detachment link shared.'
  });

  if (error) {
    return (
      <AppLayout title="Error">
        <ErrorState
          title="Failed to Load Detachment"
          message="We encountered an error while trying to load this detachment. This could be due to network issues or the faction may not exist."
          stackTrace={error}
          data-testid="detachment-error"
        />
      </AppLayout>
    );
  }

  if (loading) {
    return (
      <AppLayout title="Loading Detachment">
        <div className="flex flex-col gap-4" data-testid="detachment-loader">
          <PageHeaderSkeleton />
          <Grid>
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </Grid>
        </div>
      </AppLayout>
    );
  }

  if (!faction || !detachment) {
    return (
      <AppLayout title="Not Found">
        <ErrorState
          title="Detachment not found"
          message="The detachment you're looking for doesn't exist or may have been removed."
          showRetry={false}
          homeUrl={factionSlug ? `/faction/${factionSlug}/detachments` : '/'}
          data-testid="detachment-not-found"
        />
      </AppLayout>
    );
  }

  const backPath = `/faction/${faction.slug}/detachments`;
  const { abilities, enhancements, stratagems } = detachment;

  return (
    <AppLayout
      title={`${detachment.name} - ${faction.name}`}
      back={{ to: backPath, label: 'Detachments' }}
      crumbs={[
        { label: 'Rules', to: '/factions' },
        { label: faction.name, to: `/faction/${faction.slug}` },
        { label: 'Detachments', to: `/faction/${faction.slug}/detachments` }
      ]}
      heading={{
        title: detachment.name,
        meta: <DetachmentMeta detachment={detachment} />
      }}
      actions={[
        bookmarkAction,
        {
          icon: shareAction.icon,
          onClick: () => shareAction.onClick(),
          ariaLabel: shareAction.ariaLabel ?? 'Share detachment',
          'data-testid': shareAction['data-testid']
        }
      ]}
    >
      <div className="flex flex-col gap-3">
        {faction.link ? <RulesLink href={faction.link} /> : null}

        {abilities.length > 0 ? (
          <Section
            count={abilities.length}
            title="Detachment Abilities"
            testId="detachment-abilities"
          >
            <Grid cols={2}>
              {abilities.map((ability) => (
                <DetachmentAbilityCard key={ability.id} ability={ability} />
              ))}
            </Grid>
          </Section>
        ) : null}

        {enhancements.length > 0 ? (
          <Section
            count={enhancements.length}
            title="Enhancements"
            testId="detachment-enhancements"
          >
            <Grid cols={2}>
              {enhancements.map((enhancement) => (
                <EnhancementCard key={enhancement.id} enhancement={enhancement} />
              ))}
            </Grid>
          </Section>
        ) : null}

        {stratagems.length > 0 ? (
          <Section count={stratagems.length} title="Stratagems" testId="detachment-stratagems">
            <Grid cols={2}>
              {stratagems.map((stratagem) => (
                <StratagemCard key={stratagem.id} stratagem={stratagem} />
              ))}
            </Grid>
          </Section>
        ) : null}
      </div>
    </AppLayout>
  );
};

export default DetachmentPage;
