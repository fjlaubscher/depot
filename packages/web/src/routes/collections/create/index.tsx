import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { depot } from '@depot/core';
import AppLayout from '@/components/layout';
import { PageHeader, Card, Field, SelectField, Button } from '@/components/ui';
import { FieldSkeleton } from '@/components/ui/skeleton';
import useFactions from '@/hooks/use-factions';
import useFaction from '@/hooks/use-faction';
import { offlineStorage } from '@/data/offline-storage';
import { useToast } from '@/contexts/toast/use-toast-context';

const CreateCollectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [factionSlug, setFactionSlug] = useState<string | null>(null);

  const { factions, loading: factionsLoading } = useFactions();
  const { data: selectedFaction, loading: factionLoading } = useFaction(factionSlug || undefined);

  const factionOptions =
    factions
      ?.map((f) => ({ value: f.slug, label: f.name }))
      .sort((a, b) => a.label.localeCompare(b.label)) || [];

  useEffect(() => {
    setName((prev) => prev || (factionSlug ? `${factionSlug} collection` : ''));
  }, [factionSlug]);

  const selectedFactionIndex = useMemo(
    () => factions?.find((f) => f.slug === factionSlug || f.id === factionSlug),
    [factions, factionSlug]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !factionSlug || !selectedFactionIndex) {
      showToast({
        type: 'error',
        title: 'Missing Info',
        message: 'Please provide a name and select a faction.'
      });
      return;
    }

    const collection: depot.Collection = {
      id: crypto.randomUUID(),
      name: name.trim(),
      factionId: selectedFactionIndex.id,
      factionSlug: selectedFactionIndex.slug,
      faction: selectedFactionIndex,
      items: [],
      points: { current: 0 }
    };

    try {
      await offlineStorage.saveCollection(collection);
      navigate(`/collections/${collection.id}`);
    } catch (error) {
      console.error('Failed to create collection', error);
      showToast({ type: 'error', title: 'Error', message: 'Could not create collection.' });
    }
  };

  return (
    <AppLayout title="Create Collection">
      <div className="flex flex-col gap-4">
        <PageHeader title="Create Collection" />
        <Card>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Field>
              <label htmlFor="collection-name" className="block text-sm font-medium text-body">
                Name
              </label>
              <input
                id="collection-name"
                type="text"
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-foreground"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Pile of Shame"
                required
              />
            </Field>

            {factionsLoading ? (
              <FieldSkeleton />
            ) : (
              <SelectField
                label="Faction"
                options={factionOptions}
                value={factionSlug || ''}
                onChange={(e) => setFactionSlug(e.target.value || null)}
                placeholder="Select a Faction"
                required
              />
            )}

            {factionLoading && factionSlug ? <FieldSkeleton /> : null}

            <div className="flex justify-end gap-4">
              <Button variant="secondary" onClick={() => navigate('/collections')}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!name || !factionSlug || factionsLoading || factionLoading}
                data-testid="create-collection-submit"
              >
                Create
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CreateCollectionPage;
