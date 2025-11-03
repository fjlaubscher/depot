import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Search, Star, Settings, List, Users, ClipboardList } from 'lucide-react';

import { getImageUrl } from '@/utils/paths';

// UI Components
import AppLayout from '@/components/layout';
import { Card, Grid, Button, Alert } from '@/components/ui';

// Custom hooks
import { useAppContext } from '@/contexts/app/use-app-context';

const highlights: Array<{
  icon: LucideIcon;
  title: string;
  description: string;
  link?: string;
  linkLabel?: string;
}> = [
  {
    icon: Search,
    title: 'Thanks, Wahapedia',
    description: 'Reads the official exports so you have trusted rules on hand.'
  },
  {
    icon: List,
    title: 'Offline cache',
    description: 'Keep factions and lists stored locally for trains, basements, or spotty Wi-Fi.'
  },
  {
    icon: Settings,
    title: 'Local privacy',
    description: 'Nothing syncs anywhere unless you export it yourself—no accounts, no tracking.'
  },
  {
    icon: Star,
    title: 'Open code',
    description: 'Skim the commits, follow along, or fork your own take.',
    link: 'https://github.com/fjlaubscher/depot',
    linkLabel: 'GitHub: fjlaubscher/depot'
  }
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAppContext();

  const hasMyFactions = state.myFactions && state.myFactions.length > 0;

  return (
    <AppLayout title="Home">
      <div className="flex flex-col gap-12">
        <section className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gray-950 text-white shadow-xl dark:border-gray-800">
          <img
            src={getImageUrl('depot-hero.jpg')}
            alt="Servitors preparing a cogitator in the depths of a forge world"
            className="absolute inset-0 h-full w-full object-cover opacity-80"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950/70 via-gray-900/55 to-primary-900/35" />
          <div className="relative z-10 flex flex-col gap-10 px-6 py-12 sm:px-12 lg:flex-row lg:items-center lg:justify-between lg:py-16">
            <div className="flex flex-col gap-6 lg:max-w-xl">
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200">
                  Hobby-built Warhammer 40,000 companion
                </span>
                <h1
                  className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl"
                  data-testid="welcome-heading"
                >
                  Keep your rosters close and your games moving
                </h1>
                <p className="text-base text-white/80">
                  depot mirrors Wahapedia data, helps you plan rosters, and saves everything offline
                  so game night stays about rolling dice, not wrangling tabs.
                </p>
              </div>
              <div className="flex flex-col gap-2 xs:flex-row xs:flex-wrap xs:justify-start">
                <Button
                  onClick={() => navigate('/factions')}
                  data-testid="browse-factions-button"
                  className="gap-2 shadow-lg shadow-primary-500/25 transition-all hover:-translate-y-0.5 hover:shadow-primary-500/35"
                >
                  <Users className="h-4 w-4" />
                  <span>Browse factions</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/rosters')}
                  data-testid="roster-builder-button"
                  className="gap-2 bg-white/85 text-gray-900 shadow-lg shadow-black/10 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-black/20 dark:bg-gray-900/65 dark:text-white dark:hover:bg-gray-900/55"
                >
                  <ClipboardList className="h-4 w-4" />
                  <span>Open roster builder</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/settings')}
                  data-testid="settings-button"
                  className="gap-2 border border-white/15 bg-white/10 text-white shadow-lg shadow-primary-500/15 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:text-white hover:shadow-primary-500/25 dark:border-gray-700 dark:bg-gray-900/60 dark:hover:bg-gray-900/50 dark:text-white"
                >
                  <Settings className="h-4 w-4" />
                  <span>Adjust settings</span>
                </Button>
              </div>
              <p className="text-sm text-white/70">
                Curious about the backstory?{' '}
                <Link to="/about" className="font-semibold text-white hover:text-primary-200">
                  Learn how depot works
                </Link>
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">
              What depot actually does
            </span>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              A few notes from the workbench
            </h2>
          </div>
          <Grid cols={4} gap="lg" className="gap-4">
            {highlights.map(({ icon: Icon, title, description, link, linkLabel }) => (
              <Card
                key={title}
                padding="lg"
                className="h-full bg-white/90 shadow-lg shadow-primary-500/5 backdrop-blur dark:bg-gray-800/90"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {title}
                    </h3>
                  </div>
                  <p className="text-sm text-secondary">
                    {description}{' '}
                    {link && linkLabel && (
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary-600 hover:underline dark:text-primary-400"
                      >
                        {linkLabel}
                      </a>
                    )}
                  </p>
                </div>
              </Card>
            ))}
          </Grid>
        </section>

        {/* My Factions Quick Access */}
        {hasMyFactions && (
          <section className="flex flex-col gap-4" data-testid="quick-access-section">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">
                Jump back in
              </span>
              <h2 className="text-xl font-semibold text-foreground">Your factions, one tap away</h2>
            </div>
            <Grid cols={1} className="md:grid-cols-2 lg:grid-cols-3">
              {state.myFactions?.slice(0, 6).map((faction) => (
                <Card key={faction.slug}>
                  <Link
                    to={`/faction/${faction.slug}`}
                    className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <h3 className="text-lg font-medium text-foreground">{faction.name}</h3>
                    <p className="text-sm text-muted">View datasheets and rules</p>
                  </Link>
                </Card>
              ))}
            </Grid>
          </section>
        )}

        <section className="flex flex-col items-center gap-2 py-6 text-center">
          <p className="text-sm text-subtle">
            Data sourced from{' '}
            <a
              href="https://wahapedia.ru"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Wahapedia
            </a>
            .
          </p>
        </section>
      </div>
    </AppLayout>
  );
};

export default Home;
