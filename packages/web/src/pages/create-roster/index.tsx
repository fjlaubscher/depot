import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useFactions from '@/hooks/use-factions';
import { useRoster } from '@/contexts/roster/use-roster-context';
import { useToast } from '@/contexts/toast/use-toast-context';
import { depot } from '@depot/core';

import AppLayout from '@/components/layout';
import { PageHeader, Card, Field, SelectField, Button } from '@/components/ui';
import { FieldSkeleton } from '@/components/ui/skeleton';

const CreateRoster: React.FC = () => {
  const navigate = useNavigate();
  const { createRoster } = useRoster();
  const { factions, loading: factionsLoading } = useFactions();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [factionId, setFactionId] = useState<string | null>(null);
  const [maxPoints, setMaxPoints] = useState(2000);

  const factionOptions = factions?.map((f) => ({ value: f.id, label: f.name })) || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please enter a roster name.'
      });
      return;
    }
    if (!factionId) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please select a faction.'
      });
      return;
    }
    if (maxPoints <= 0) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Max points must be greater than 0.'
      });
      return;
    }

    const newId = createRoster({ name: name.trim(), factionId, maxPoints });
    navigate(`/rosters/${newId}`);
  };

  return (
    <AppLayout title="Create Roster">
      <div className="flex flex-col gap-4">
        <PageHeader title="Create New Roster" />
        <Card>
          <form data-testid="roster-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field data-testid="roster-name-field">
              <label
                htmlFor="roster-name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Roster Name
              </label>
              <input
                data-testid="roster-name-input"
                id="roster-name"
                type="text"
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>

            {factionsLoading ? (
              <FieldSkeleton />
            ) : (
              <SelectField
                data-testid="faction-field"
                label="Faction"
                options={factionOptions}
                value={factionId || ''}
                onChange={(e) => setFactionId(e.target.value || null)}
                placeholder="Select a Faction"
                required
              />
            )}

            <Field data-testid="max-points-field">
              <label
                htmlFor="max-points"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Max Points
              </label>
              <input
                data-testid="max-points-input"
                id="max-points"
                type="number"
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={maxPoints.toString()}
                onChange={(e) => setMaxPoints(parseInt(e.target.value, 10))}
                required
              />
            </Field>

            <div className="flex justify-end gap-2">
              <Button
                data-testid="cancel-button"
                variant="secondary"
                onClick={() => navigate('/rosters')}
              >
                Cancel
              </Button>
              <Button
                data-testid="submit-button"
                type="submit"
                disabled={!name || !factionId || factionsLoading}
              >
                Create Roster
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CreateRoster;
