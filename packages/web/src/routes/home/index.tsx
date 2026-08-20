import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import AppLayout from '@/components/layout';
import { Loader } from '@/components/ui';
import { ListEmptyState } from '@/components/shared';
import { useFactionsContext } from '@/contexts/factions/context';
import useRosters from '@/hooks/use-rosters';
import useCollections from '@/hooks/use-collections';
import useBookmarks from '@/hooks/use-bookmarks';
import { takeRecent } from '@/utils/recent';

import SectionHeader from './_components/section-header';
import RosterPreviewCard from './_components/roster-preview-card';
import CollectionPreviewCard from './_components/collection-preview-card';
import BookmarkCard from './_components/bookmark-card';
import BookmarksPanel from './_components/bookmarks-panel';

const PREVIEW_LIMIT = 4;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { dataVersion } = useFactionsContext();
  const { rosters, loading: rostersLoading } = useRosters();
  const { collections, loading: collectionsLoading } = useCollections();
  const { bookmarks, loading: bookmarksLoading } = useBookmarks();

  const dataVersionLabel = dataVersion ?? 'Unknown';

  const recentRosters = useMemo(() => takeRecent(rosters, PREVIEW_LIMIT), [rosters]);
  const recentCollections = useMemo(() => takeRecent(collections, PREVIEW_LIMIT), [collections]);

  return (
    <AppLayout title="depot - Offline Warhammer 40,000 Companion">
      <div className="flex flex-col gap-6">
        <BookmarksPanel
          header={
            bookmarks.length > 0 ? (
              <SectionHeader title="Bookmarks" count={bookmarks.length} tone="on-media" />
            ) : null
          }
        >
          {bookmarksLoading ? (
            <div className="flex justify-center py-6">
              <Loader color="white" />
            </div>
          ) : bookmarks.length === 0 ? (
            <div
              className="flex flex-col items-center gap-2 px-4 py-10 text-center sm:py-14"
              data-testid="empty-bookmarks-home"
            >
              <p className="text-lg font-semibold text-white">Your bookmarks will show up here</p>
              <p className="max-w-md text-sm text-white/75">
                Bookmark a faction or datasheet from its page to pin it to the home screen.
              </p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
              data-testid="bookmark-previews"
            >
              {bookmarks.map((bookmark) => (
                <BookmarkCard key={bookmark.id} bookmark={bookmark} />
              ))}
            </div>
          )}
        </BookmarksPanel>

        <section className="flex flex-col gap-4" data-testid="rosters-section">
          <SectionHeader
            title="Recent rosters"
            count={rosters.length}
            viewAllTo={rosters.length > 0 ? '/rosters' : undefined}
            viewAllTestId="view-all-rosters"
          />

          {rostersLoading ? (
            <div className="flex justify-center py-6">
              <Loader />
            </div>
          ) : rosters.length === 0 ? (
            <ListEmptyState
              title="No rosters yet"
              actionLabel="Create roster"
              onAction={() => navigate('/rosters/create')}
              testId="empty-rosters-home"
            />
          ) : (
            <div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
              data-testid="roster-previews"
            >
              {recentRosters.map((roster) => (
                <RosterPreviewCard key={roster.id} roster={roster} />
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4" data-testid="collections-section">
          <SectionHeader
            title="Recent collections"
            count={collections.length}
            viewAllTo={collections.length > 0 ? '/collections' : undefined}
            viewAllTestId="view-all-collections"
          />

          {collectionsLoading ? (
            <div className="flex justify-center py-6">
              <Loader />
            </div>
          ) : collections.length === 0 ? (
            <ListEmptyState
              title="No collections yet"
              actionLabel="Create collection"
              onAction={() => navigate('/collections/create')}
              testId="empty-collections-home"
            />
          ) : (
            <div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
              data-testid="collection-previews"
            >
              {recentCollections.map((collection) => (
                <CollectionPreviewCard key={collection.id} collection={collection} />
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col items-center gap-1 text-center">
          <p className="text-sm text-subtle">
            Data sourced from{' '}
            <a
              href="https://wahapedia.ru"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline dark:text-primary-400"
            >
              Wahapedia
            </a>
          </p>
          <p className="text-xs text-subtle">Last updated: {dataVersionLabel}</p>
        </section>
      </div>
    </AppLayout>
  );
};

export default Home;
