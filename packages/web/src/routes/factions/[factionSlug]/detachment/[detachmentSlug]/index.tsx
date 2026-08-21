import type { FC } from 'react';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Bookmark, BookmarkCheck } from 'lucide-react';

// components
import AppLayout from '@/components/layout';
import {
  PageHeader,
  ErrorState,
  Breadcrumbs,
  Grid,
  PageHeaderSkeleton,
  SkeletonCard
} from '@/components/ui';
import {
  BackButton,
  DetachmentAbilityCard,
  EnhancementCard,
  StratagemCard
} from '@/components/shared';
import { DetachmentMeta } from '../../_components/faction-detachments';

// hooks
import useFaction from '@/hooks/use-faction';
import useBookmarks from '@/hooks/use-bookmarks';
import { useSettingsContext } from '@/contexts/settings/context';
import { useToast } from '@/contexts/toast/context';
import { useShareAction } from '@/hooks/use-share-action';

// utils
import { buildAbsoluteUrl } from '@/utils/paths';
import { createDetachmentBookmark, detachmentBookmarkId } from '@/utils/bookmarks';
import { formatDetachmentOptionLabel, matchDetachment } from '@depot/core/utils/detachments';

const Section: FC<{ title: string; testId: string; children: React.ReactNode }> = ({
  title,
  testId,
  children
}) => (
  <section className="flex flex-col gap-2" data-testid={testId}>
    <h2 className="text-sm font-semibold uppercase tracking-wide text-body">{title}</h2>
    {children}
  </section>
);

const DetachmentPage: FC = () => {
  const { factionSlug, detachmentSlug } = useParams<{
    factionSlug: string;
    detachmentSlug: string;
  }>();
  const { data: faction, loading, error } = useFaction(factionSlug);
  const { settings } = useSettingsContext();
  const { showToast } = useToast();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const detachment = faction
    ? matchDetachment({ slug: detachmentSlug }, faction.detachments)
    : undefined;

  const bookmarked =
    faction && detachment
      ? isBookmarked(detachmentBookmarkId(faction.slug, detachment.slug))
      : false;

  const handleToggleBookmark = useCallback(async () => {
    if (!faction || !detachment) return;
    try {
      const next = await toggleBookmark(createDetachmentBookmark(faction, detachment));
      showToast({
        type: 'success',
        title: next ? 'Bookmarked' : 'Bookmark removed',
        message: next
          ? `${detachment.name} pinned to your desk.`
          : `${detachment.name} removed from bookmarks.`
      });
    } catch (err) {
      console.error('Failed to toggle detachment bookmark', err);
      showToast({
        type: 'error',
        title: 'Bookmark failed',
        message: 'Could not update bookmarks.'
      });
    }
  }, [detachment, faction, showToast, toggleBookmark]);

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
          homeUrl={factionSlug ? `/faction/${factionSlug}?tab=detachments` : '/'}
          data-testid="detachment-not-found"
        />
      </AppLayout>
    );
  }

  const backPath = `/faction/${faction.slug}?tab=detachments`;
  const { abilities, enhancements, stratagems } = detachment;

  return (
    <AppLayout title={`${detachment.name} - ${faction.name}`}>
      <div className="flex flex-col gap-4">
        <BackButton
          to={backPath}
          label={faction.name}
          ariaLabel={`Back to ${faction.name}`}
          className="md:hidden"
        />

        <div className="hidden md:block">
          <Breadcrumbs
            items={[
              { label: 'Factions', path: '/factions' },
              { label: faction.name, path: backPath },
              {
                label: detachment.name,
                path: `/faction/${faction.slug}/detachment/${detachment.slug}`
              }
            ]}
          />
        </div>

        <PageHeader
          title={detachment.name}
          subtitle={formatDetachmentOptionLabel(detachment)}
          actions={[
            {
              icon: bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />,
              onClick: () => {
                void handleToggleBookmark();
              },
              ariaLabel: bookmarked ? 'Remove bookmark' : 'Bookmark detachment',
              variant: bookmarked ? 'primary' : 'ghost',
              'data-testid': 'bookmark-detachment-button'
            },
            {
              icon: shareAction.icon,
              onClick: () => shareAction.onClick(),
              ariaLabel: shareAction.ariaLabel ?? 'Share detachment',
              'data-testid': shareAction['data-testid']
            }
          ]}
          data-testid="detachment-header"
        />

        <DetachmentMeta detachment={detachment} />

        {settings?.showFluff && detachment.legend ? (
          <div
            className="text-sm text-muted font-medium italic"
            data-testid="detachment-legend"
            dangerouslySetInnerHTML={{ __html: detachment.legend }}
          />
        ) : null}

        {abilities.length > 0 ? (
          <Section title="Detachment Abilities" testId="detachment-abilities">
            <Grid cols={2}>
              {abilities.map((ability) => (
                <DetachmentAbilityCard key={ability.id} ability={ability} />
              ))}
            </Grid>
          </Section>
        ) : null}

        {enhancements.length > 0 ? (
          <Section title="Enhancements" testId="detachment-enhancements">
            <Grid cols={2}>
              {enhancements.map((enhancement) => (
                <EnhancementCard key={enhancement.id} enhancement={enhancement} />
              ))}
            </Grid>
          </Section>
        ) : null}

        {stratagems.length > 0 ? (
          <Section title="Stratagems" testId="detachment-stratagems">
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
