import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

// components
import AppLayout from '@/components/layout';
import { ErrorState, Grid, PageHeaderSkeleton, SectionHeader, SkeletonCard } from '@/components/ui';
import { DetachmentAbilityCard, EnhancementCard, StratagemCard } from '@/components/shared';

// hooks
import useFaction from '@/hooks/use-faction';
import { useSettingsContext } from '@/contexts/settings/context';
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
  const { t } = useTranslation('common');
  const { t: tc } = useTranslation('catalog');
  const { factionSlug, detachmentSlug } = useParams<{
    factionSlug: string;
    detachmentSlug: string;
  }>();
  const { data: faction, loading, error } = useFaction(factionSlug);
  const { settings } = useSettingsContext();

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
    ariaLabel: t('share.detachmentLabel'),
    testId: 'share-detachment',
    copySuccessKey: 'share.detachmentCopied',
    shareSuccessKey: 'share.detachmentShared'
  });

  if (error) {
    return (
      <AppLayout title={t('error.label')}>
        <ErrorState
          title={tc('errors.detachmentTitle')}
          message={tc('errors.detachmentMessage')}
          stackTrace={error}
          data-testid="detachment-error"
        />
      </AppLayout>
    );
  }

  if (loading) {
    return (
      <AppLayout title={tc('loadingDetachment')}>
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
      <AppLayout title={tc('notFound')}>
        <ErrorState
          title={tc('errors.detachmentNotFound')}
          message={tc('errors.detachmentMissing')}
          showRetry={false}
          homeUrl={factionSlug ? `/faction/${factionSlug}/detachments` : '/'}
          data-testid="detachment-not-found"
        />
      </AppLayout>
    );
  }

  const backPath = `/faction/${faction.slug}/detachments`;
  const { abilities, enhancements, stratagems } = detachment;
  const headingSubtitle = [
    detachment.dp && `${detachment.dp} DP`,
    detachment.forceDisposition || detachment.type
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <AppLayout
      title={`${detachment.name} - ${faction.name}`}
      back={{ to: backPath, label: t('navigation.detachments') }}
      crumbs={[
        { label: t('navigation.rules'), to: '/factions' },
        { label: faction.name, to: `/faction/${faction.slug}` },
        { label: t('navigation.detachments'), to: `/faction/${faction.slug}/detachments` }
      ]}
      heading={{ title: detachment.name, subtitle: headingSubtitle || undefined }}
      actions={[
        bookmarkAction,
        {
          icon: shareAction.icon,
          onClick: () => shareAction.onClick(),
          ariaLabel: shareAction.ariaLabel ?? t('share.detachmentLabel'),
          'data-testid': shareAction['data-testid']
        }
      ]}
    >
      <div className="flex flex-col gap-3">
        {settings?.showFluff && detachment.legend ? (
          <div
            className="text-sm text-muted font-medium italic"
            data-testid="detachment-legend"
            dangerouslySetInnerHTML={{ __html: detachment.legend }}
          />
        ) : null}

        {abilities.length > 0 ? (
          <Section
            count={abilities.length}
            title={tc('detachmentAbilities')}
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
            title={tc('enhancements')}
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
          <Section
            count={stratagems.length}
            title={tc('stratagems')}
            testId="detachment-stratagems"
          >
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
