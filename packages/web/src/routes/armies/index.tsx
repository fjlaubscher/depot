import React, { useMemo } from 'react';
import { Link } from '@/lib/navigation';
import { Boxes, ClipboardList } from 'lucide-react';

import AppLayout from '@/components/layout';
import { Card, Loader, SectionHeader } from '@/components/ui';
import { useCollections } from '@/hooks/use-collections';
import useRosters from '@/hooks/use-rosters';
import { takeRecent } from '@/utils/recent';
import { validateRoster } from '@depot/core/utils/roster-legality';
import CollectionRow from '@/routes/home/_components/collection-row';
import RosterRow from '@/routes/home/_components/roster-row';

const PREVIEW_LIMIT = 3;

const ArmiesPage: React.FC = () => {
  const { collections, loading: collectionsLoading } = useCollections();
  const { rosters, loading: rostersLoading } = useRosters();
  const loading = collectionsLoading || rostersLoading;

  const recentCollections = useMemo(() => takeRecent(collections, PREVIEW_LIMIT), [collections]);
  const recentRosters = useMemo(() => takeRecent(rosters, PREVIEW_LIMIT), [rosters]);

  return (
    <AppLayout title="Armies">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Armies</h1>
          <p className="mt-0.5 font-mono text-[10px] font-medium uppercase text-muted">
            Cabinets, lists, and later crusade
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Link to="/collections" data-testid="armies-tile-collections" className="block">
            <Card interactive className="flex h-full flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-xs bg-surface-soft text-accent">
                    <Boxes size={16} />
                  </span>
                  <Card.Title as="h2" className="text-base">
                    Collections
                  </Card.Title>
                </div>
                <span className="font-mono text-xs font-bold text-accent">
                  {collections.length}
                </span>
              </div>
              <Card.Description>
                Painted inventory and readiness. Open a cabinet, then build a list from it.
              </Card.Description>
            </Card>
          </Link>

          <Link to="/rosters" data-testid="armies-tile-rosters" className="block">
            <Card interactive className="flex h-full flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-xs bg-surface-soft text-accent">
                    <ClipboardList size={16} />
                  </span>
                  <Card.Title as="h2" className="text-base">
                    Rosters
                  </Card.Title>
                </div>
                <span className="font-mono text-xs font-bold text-accent">{rosters.length}</span>
              </div>
              <Card.Description>
                Matched-play lists, including theorycraft that is not attached to a collection.
              </Card.Description>
            </Card>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader />
          </div>
        ) : null}

        {collections.length > 0 ? (
          <section className="flex flex-col gap-1.5" data-testid="armies-recent-collections">
            <SectionHeader
              title="Recent collections"
              count={collections.length}
              viewAllTo="/collections"
              viewAllTestId="armies-view-all-collections"
            />
            <div className="grid gap-1 sm:grid-cols-2">
              {recentCollections.map((collection) => (
                <CollectionRow key={collection.id} collection={collection} />
              ))}
            </div>
          </section>
        ) : null}

        {rosters.length > 0 ? (
          <section className="flex flex-col gap-1.5" data-testid="armies-recent-rosters">
            <SectionHeader
              title="Recent rosters"
              count={rosters.length}
              viewAllTo="/rosters"
              viewAllTestId="armies-view-all-rosters"
            />
            <div className="grid gap-1 sm:grid-cols-2">
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
      </div>
    </AppLayout>
  );
};

export default ArmiesPage;
