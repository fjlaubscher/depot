import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import AppLayout from '@/components/layout';
import Logo from '@/components/logo';
import { Loader, SectionHeader } from '@/components/ui';
import DataVersion from '@/components/shared/data-version';
import useRosters from '@/hooks/use-rosters';
import useCollections from '@/hooks/use-collections';
import useBookmarks from '@/hooks/use-bookmarks';
import { takeRecent } from '@/utils/recent';
import { validateRoster } from '@depot/core/utils/roster-legality';

import Hero from './_components/hero';
import InstallBanner from './_components/install-banner';
import BookmarkCard from './_components/bookmark-card';
import RosterRow from './_components/roster-row';
import CollectionRow from './_components/collection-row';

const PREVIEW_LIMIT = 3;

const Home: React.FC = () => {
  const { t, i18n } = useTranslation('home');
  const number = new Intl.NumberFormat(i18n.resolvedLanguage);
  const { rosters, loading: rostersLoading } = useRosters();
  const { collections, loading: collectionsLoading } = useCollections();
  const { bookmarks, loading: bookmarksLoading } = useBookmarks();

  const loading = rostersLoading || collectionsLoading || bookmarksLoading;
  const recentRosters = useMemo(() => takeRecent(rosters, PREVIEW_LIMIT), [rosters]);
  const recentCollections = useMemo(() => takeRecent(collections, PREVIEW_LIMIT), [collections]);

  return (
    <AppLayout title={t('documentTitle')}>
      <div className="flex flex-col gap-4">
        {/* The desktop rail already carries the brand; this is the mobile header. */}
        <div className="flex items-center gap-2 lg:hidden">
          <span className="grid size-6 place-items-center rounded-xs bg-accent-600 text-white dark:bg-accent-500">
            <Logo />
          </span>
          <span className="text-[17px] leading-none font-bold text-foreground">depot</span>
        </div>

        <Hero />

        <InstallBanner />

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader />
          </div>
        ) : null}

        {bookmarks.length > 0 ? (
          <section
            className="flex flex-col gap-1.5"
            data-testid="bookmarks-section"
            aria-label={t('bookmarkCount', { count: bookmarks.length })}
          >
            <SectionHeader title={t('bookmarks')} count={number.format(bookmarks.length)} />
            <div className="-mx-4 flex gap-1 overflow-x-auto px-4" data-testid="bookmark-previews">
              {bookmarks.map((bookmark) => (
                <BookmarkCard key={bookmark.id} bookmark={bookmark} />
              ))}
            </div>
          </section>
        ) : null}

        {rosters.length > 0 ? (
          <section
            className="flex flex-col gap-1.5"
            data-testid="rosters-section"
            aria-label={t('rosterCount', { count: rosters.length })}
          >
            <SectionHeader
              title={t('recentRosters')}
              count={number.format(rosters.length)}
              viewAllTo="/rosters"
              viewAllTestId="view-all-rosters"
            />
            <div className="grid gap-1 sm:grid-cols-2" data-testid="roster-previews">
              {recentRosters.map((roster) => (
                <RosterRow
                  key={roster.id}
                  roster={roster}
                  invalid={validateRoster(roster).length > 0}
                />
              ))}
            </div>
          </section>
        ) : null}

        {collections.length > 0 ? (
          <section
            className="flex flex-col gap-1.5"
            data-testid="collections-section"
            aria-label={t('collectionCount', { count: collections.length })}
          >
            <SectionHeader
              title={t('collections')}
              count={number.format(collections.length)}
              viewAllTo="/collections"
              viewAllTestId="view-all-collections"
            />
            <div className="grid gap-1 sm:grid-cols-2" data-testid="collection-previews">
              {recentCollections.map((collection) => (
                <CollectionRow key={collection.id} collection={collection} />
              ))}
            </div>
          </section>
        ) : null}

        <DataVersion className="pt-2 text-center lg:hidden" data-testid="data-version" />
      </div>
    </AppLayout>
  );
};

export default Home;
