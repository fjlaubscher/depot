import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Search, Star, Settings, List, Users, ClipboardList, Boxes } from 'lucide-react';

import { getImageUrl } from '@/utils/paths';

// UI Components
import AppLayout from '@/components/layout';
import { Card, Grid } from '@/components/ui';

// Custom hooks
import useFactionIndex from '@/hooks/use-faction-index';
import useSettings from '@/hooks/use-settings';

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
  const { settings } = useSettings();
  const { dataVersion } = useFactionIndex();
  const collectionLabel = useMemo(
    () => ((settings.usePileOfShameLabel ?? true) ? 'Pile of Shame' : 'Collections'),
    [settings.usePileOfShameLabel]
  );
  const dataVersionLabel = dataVersion ?? 'Unknown';

  const actionTiles: Array<{
    key: 'collections' | 'factions' | 'rosters' | 'settings';
    icon: LucideIcon;
    title: string;
    description: string;
    path: string;
    testId: string;
  }> = [
    {
      key: 'collections',
      icon: Boxes,
      title: collectionLabel,
      description: 'Track your pile of shame and prep future lists.',
      path: '/collections',
      testId: 'collections-button'
    },
    {
      key: 'factions',
      icon: Users,
      title: 'Factions',
      description: 'Browse every detachment, rule, and enhancement.',
      path: '/factions',
      testId: 'browse-factions-button'
    },
    {
      key: 'rosters',
      icon: ClipboardList,
      title: 'Rosters',
      description: 'Build, tweak, and store lists offline.',
      path: '/rosters',
      testId: 'roster-builder-button'
    },
    {
      key: 'settings',
      icon: Settings,
      title: 'Settings',
      description: 'Tweak the app to your liking.',
      path: '/settings',
      testId: 'settings-button'
    }
  ];

  return (
    <AppLayout title="depot - Offline Warhammer 40,000 Companion">
      <div className="flex flex-col gap-12">
        <section className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gray-950 text-white shadow-xl dark:border-gray-800">
          <img
            src={getImageUrl('depot-hero.jpg')}
            alt="Servitors preparing a cogitator in the depths of a forge world"
            className="absolute inset-0 h-full w-full object-cover opacity-80"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950/70 via-gray-900/55 to-primary-900/35" />
          <div className="relative z-10 grid gap-10 px-6 py-12 sm:px-12 lg:grid-cols-[3fr_2fr] lg:items-center lg:gap-16 lg:py-16">
            <div className="flex flex-col gap-6">
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
                  Mirror Wahapedia exports, prep your armies, and take everything offline so game
                  night stays about rolling dice, not wrangling tabs.
                </p>
              </div>
              <p className="text-sm text-white/70">
                Curious about the backstory?{' '}
                <Link to="/about" className="font-semibold text-white hover:text-primary-200">
                  Learn how depot works
                </Link>
              </p>
            </div>
            <div className="grid grid-cols-2 grid-rows-2 gap-4">
              {actionTiles.map(({ icon: Icon, title, description, path, testId }) => {
                return (
                  <button
                    key={title}
                    type="button"
                    onClick={() => navigate(path)}
                    data-testid={testId}
                    className={`
                    group relative flex h-full min-h-[120px] cursor-pointer flex-col justify-between rounded-xl
                    border border-white/15 bg-white/10 p-4 text-left text-white shadow-lg shadow-primary-900/20 transition
                    hover:-translate-y-0.5 hover:bg-white/20 focus-visible:outline
                    focus-visible:outline-offset-2 focus-visible:outline-white dark:border-gray-700
                    dark:bg-gray-900/60 dark:hover:bg-gray-900/50
                  `}
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white transition group-hover:bg-white/25">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div className="flex flex-col gap-1">
                      <span className="text-base font-semibold">{title}</span>
                      <span className="text-sm text-white/80 leading-snug">{description}</span>
                    </div>
                  </button>
                );
              })}
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

        <section className="flex flex-col items-center text-center">
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
          </p>
          <p className="text-xs text-subtle">Last Updated: {dataVersionLabel}</p>
        </section>
      </div>
    </AppLayout>
  );
};

export default Home;
