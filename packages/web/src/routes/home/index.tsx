import React, { useMemo } from 'react';
import { Bookmark, Boxes, ClipboardList } from 'lucide-react';

import AppLayout from '@/components/layout';
import { LinkCard, Loader } from '@/components/ui';
import { useFactionsContext } from '@/contexts/factions/context';
import useRosters from '@/hooks/use-rosters';
import useCollections from '@/hooks/use-collections';
import useBookmarks from '@/hooks/use-bookmarks';
import { takeRecent } from '@/utils/recent';

import Hero from './_components/hero';
import SectionHeader from './_components/section-header';
import RosterPreviewCard from './_components/roster-preview-card';
import CollectionPreviewCard from './_components/collection-preview-card';
import BookmarkCard from './_components/bookmark-card';

const PREVIEW_LIMIT = 3;

const Home: React.FC = () => {
  const { dataVersion } = useFactionsContext();
  const { rosters, loading: rostersLoading } = useRosters();
  const { collections, loading: collectionsLoading } = useCollections();
  const { bookmarks, loading: bookmarksLoading } = useBookmarks();

  const loading = rostersLoading || collectionsLoading || bookmarksLoading;
  const recentRosters = useMemo(() => takeRecent(rosters, PREVIEW_LIMIT), [rosters]);
  const recentCollections = useMemo(() => takeRecent(collections, PREVIEW_LIMIT), [collections]);
  const isEmpty = !loading && rosters.length === 0 && collections.length === 0;

  return (
    <AppLayout title="depot - Offline Warhammer 40,000 Companion">
      <div className="flex flex-col gap-6">
        <Hero />

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader />
          </div>
        ) : null}

        {bookmarks.length > 0 ? (
          <section className="flex flex-col gap-3" data-testid="bookmarks-section">
            <SectionHeader icon={Bookmark} title="Bookmarks" count={bookmarks.length} />
            <div className="flex flex-wrap gap-2" data-testid="bookmark-previews">
              {bookmarks.map((bookmark) => (
                <BookmarkCard key={bookmark.id} bookmark={bookmark} />
              ))}
            </div>
          </section>
        ) : null}

        {isEmpty ? (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2" data-testid="get-started">
            <LinkCard
              to="/collections"
              icon={<Boxes size={20} />}
              iconClassName="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
              showArrow
              description="Catalogue the armies you own once, then spin up list after list from them."
            >
              Create collection
            </LinkCard>
            <LinkCard
              to="/rosters"
              icon={<ClipboardList size={20} />}
              showArrow
              description="Build a one-off list straight from the datasheets."
            >
              Create roster
            </LinkCard>
          </section>
        ) : null}

        {collections.length > 0 ? (
          <section className="flex flex-col gap-3" data-testid="collections-section">
            <SectionHeader
              icon={Boxes}
              title="Recent collections"
              count={collections.length}
              viewAllTo="/collections"
              viewAllTestId="view-all-collections"
            />
            <div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              data-testid="collection-previews"
            >
              {recentCollections.map((collection) => (
                <CollectionPreviewCard key={collection.id} collection={collection} />
              ))}
            </div>
          </section>
        ) : null}

        {rosters.length > 0 ? (
          <section className="flex flex-col gap-3" data-testid="rosters-section">
            <SectionHeader
              icon={ClipboardList}
              title="Recent rosters"
              count={rosters.length}
              viewAllTo="/rosters"
              viewAllTestId="view-all-rosters"
            />
            <div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              data-testid="roster-previews"
            >
              {recentRosters.map((roster) => (
                <RosterPreviewCard key={roster.id} roster={roster} />
              ))}
            </div>
          </section>
        ) : null}

        <p className="text-center text-xs text-subtle">Last updated: {dataVersion ?? 'Unknown'}</p>
      </div>
    </AppLayout>
  );
};

export default Home;
