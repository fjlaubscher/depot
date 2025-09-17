import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import useFactions from '@/hooks/use-factions';
import useFaction from '@/hooks/use-faction';
import { useRoster } from '@/contexts/roster/use-roster-context';
import { useToast } from '@/contexts/toast/use-toast-context';
import { depot } from '@depot/core';

import { groupFactionDataByDetachment } from '@/utils/faction';

import AppLayout from '@/components/layout';
import { PageHeader, Card, Field, SelectField, Button } from '@/components/ui';
import { FieldSkeleton } from '@/components/ui/skeleton';

const CreateRoster: React.FC = () => {
  const navigate = useNavigate();
  const { createRoster } = useRoster();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [factionId, setFactionId] = useState<string | null>(null);
  const [detachmentName, setDetachmentName] = useState<string | null>(null);
  const [maxPoints, setMaxPoints] = useState(2000);

  const { factions, loading: factionsLoading } = useFactions();
  const { data: selectedFaction, loading: factionLoading } = useFaction(factionId || undefined);

  const factionOptions = factions
    ?.map((f) => ({ value: f.id, label: f.name }))
    .sort((a, b) => a.label.localeCompare(b.label)) || [];

  // Group detachment data from selected faction
  const detachmentsData = useMemo(() => {
    if (
      !selectedFaction?.detachmentAbilities ||
      !selectedFaction?.enhancements ||
      !selectedFaction?.stratagems
    ) {
      return {};
    }

    return groupFactionDataByDetachment(
      selectedFaction.detachmentAbilities,
      selectedFaction.enhancements,
      selectedFaction.stratagems
    );
  }, [selectedFaction]);

  // Create detachment options from grouped data
  const detachmentOptions = useMemo(() => {
    return Object.keys(detachmentsData)
      .sort()
      .map((name) => ({ value: name, label: name }));
  }, [detachmentsData]);

  // Reset detachment when faction changes
  useEffect(() => {
    if (factionId && detachmentName) {
      setDetachmentName(null);
    }
  }, [factionId]);

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
    if (!detachmentName) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please select a detachment.'
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

    // Build the complete detachment object using lookup
    const selectedDetachmentData = detachmentsData[detachmentName];
    if (!selectedDetachmentData) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Selected detachment not found.'
      });
      return;
    }

    const detachment: depot.Detachment = {
      name: detachmentName,
      abilities: selectedDetachmentData.abilities,
      enhancements: selectedDetachmentData.enhancements,
      stratagems: selectedDetachmentData.stratagems
    };

    // Find the faction Index entry
    const selectedFactionIndex = factions?.find((f) => f.id === factionId);
    if (!selectedFactionIndex) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Selected faction not found.'
      });
      return;
    }

    const newId = createRoster({
      name: name.trim(),
      factionId,
      faction: selectedFactionIndex,
      maxPoints,
      detachment
    });
    navigate(`/rosters/${newId}/edit`);
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

            {factionLoading ? (
              <FieldSkeleton />
            ) : factionId && detachmentOptions.length > 0 ? (
              <SelectField
                data-testid="detachment-field"
                label="Detachment"
                options={detachmentOptions}
                value={detachmentName || ''}
                onChange={(e) => setDetachmentName(e.target.value || null)}
                placeholder="Select a Detachment"
                required
              />
            ) : factionId ? (
              <Field>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Detachment
                </label>
                <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No detachments available for this faction
                </div>
              </Field>
            ) : null}

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

            <div className="flex justify-end gap-4">
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
                disabled={
                  !name || !factionId || !detachmentName || factionsLoading || factionLoading
                }
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
