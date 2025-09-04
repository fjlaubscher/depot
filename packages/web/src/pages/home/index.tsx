import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCog, FaSearch, FaStar, FaCogs } from 'react-icons/fa';
import { depot } from '@depot/core';

// UI Components
import AppLayout from '@/components/layout';
import Card from '@/components/ui/card';
import Grid from '@/components/ui/grid';
import Button from '@/components/ui/button';

// Custom hooks
import useMyFactions from '@/hooks/use-my-factions';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [myFactions] = useMyFactions();

  const hasMyFactions = myFactions && myFactions.length > 0;

  return (
    <AppLayout title="Home">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="text-center">
          <h1
            className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
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
          <Card>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FaSearch className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Browse Factions
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Explore all Warhammer 40K factions and their datasheets
                </p>
              </div>
              <Button onClick={() => navigate('/factions')} data-testid="browse-factions-button">
                Browse
              </Button>
            </div>
          </Card>

          {hasMyFactions && (
            <Card>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <FaStar className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h3
                    className="text-lg font-semibold text-gray-900 dark:text-white"
                    data-testid="my-factions-card-heading"
                  >
                    My Factions
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {myFactions?.length || 0} favorite faction
                    {(myFactions?.length || 0) !== 1 ? 's' : ''} saved
                  </p>
                </div>
              </div>
            </Card>
          )}

          <Card>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <FaCogs className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <h3
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                  data-testid="settings-card-heading"
                >
                  Settings
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configure Forge World and Legends content
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => navigate('/settings')}
                data-testid="settings-button"
              >
                Configure
              </Button>
            </div>
          </Card>
        </Grid>

        {/* My Factions Quick Access */}
        {hasMyFactions && (
          <div className="space-y-4" data-testid="quick-access-section">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Access</h2>
            <Grid>
              {myFactions?.slice(0, 6).map((faction) => (
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
              className="text-blue-600 dark:text-blue-400 hover:underline"
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
