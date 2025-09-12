import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Star, Settings, List, Cog } from 'lucide-react';
import { depot } from '@depot/core';

// UI Components
import AppLayout from '@/components/layout';
import { Card, Grid, Button, DashboardCard } from '@/components/ui';

// Custom hooks
import { useAppContext } from '@/contexts/app/use-app-context';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAppContext();

  const hasMyFactions = state.myFactions && state.myFactions.length > 0;

  return (
    <AppLayout title="Home">
      <div className="flex flex-col gap-4">
        {/* Welcome Section */}
        <div className="text-center flex flex-col gap-2">
          <h1
            className="text-3xl font-bold text-gray-900 dark:text-white"
            data-testid="welcome-heading"
          >
            Welcome to depot
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your Warhammer 40,000 companion app powered by Wahapedia data
          </p>
        </div>

        {/* Quick Actions */}
        <Grid>
          <DashboardCard
            icon={
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <Search className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
            }
            title="Browse Factions"
            description="Explore all Warhammer 40K factions and their datasheets"
            action={
              <Button onClick={() => navigate('/factions')} data-testid="browse-factions-button">
                Browse
              </Button>
            }
          />

          <DashboardCard
            icon={
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <List className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            }
            title="Roster Builder"
            description="Create and manage your army rosters"
            action={
              <Link to="/rosters">
                <Button
                  data-testid="roster-builder-button"
                  className="bg-purple-600 hover:bg-purple-700 border-purple-600 text-white"
                >
                  View Rosters
                </Button>
              </Link>
            }
          />

          {hasMyFactions && (
            <DashboardCard
              icon={
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              }
              title="My Factions"
              description={`${state.myFactions?.length || 0} favorite faction${(state.myFactions?.length || 0) !== 1 ? 's' : ''} saved`}
              titleTestId="my-factions-card-heading"
            />
          )}

          <DashboardCard
            icon={
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Settings className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
            }
            title="Settings"
            description="Configure Forge World and Legends content"
            titleTestId="settings-card-heading"
            action={
              <Button
                variant="secondary"
                onClick={() => navigate('/settings')}
                data-testid="settings-button"
              >
                Configure
              </Button>
            }
          />
        </Grid>

        {/* My Factions Quick Access */}
        {hasMyFactions && (
          <div className="flex flex-col gap-4" data-testid="quick-access-section">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Access</h2>
            <Grid>
              {state.myFactions?.slice(0, 6).map((faction) => (
                <Card key={faction.id}>
                  <Link
                    to={`/faction/${faction.id}`}
                    className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {faction.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      View datasheets and rules
                    </p>
                  </Link>
                </Card>
              ))}
            </Grid>
          </div>
        )}

        {/* App Info */}
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-500">
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
        </div>
      </div>
    </AppLayout>
  );
};

export default Home;
