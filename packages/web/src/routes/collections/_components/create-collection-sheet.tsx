import React, { useState } from 'react';
import { useNavigate } from '@/lib/navigation';
import type { depot } from '@depot/core';

import { Sheet, Field, SelectField, Button } from '@/components/ui';
import { FieldSkeleton } from '@/components/ui/skeleton';
import { useFactionsContext } from '@/contexts/factions/context';
import { offlineStorage } from '@/data/offline-storage';
import { useToast } from '@/contexts/toast/context';
import { sortByName } from '@depot/core/utils/common';

interface Props {
  open: boolean;
  onClose: () => void;
}

const CreateCollectionForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { factionIndex: factions, loading: factionsLoading, dataVersion } = useFactionsContext();
  const [name, setName] = useState('');
  const [factionSlug, setFactionSlug] = useState('');

  const factionOptions = sortByName(factions ?? []).map((f) => ({ value: f.slug, label: f.name }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const faction = factions?.find((f) => f.slug === factionSlug);
    if (!name.trim() || !faction) {
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
      factionId: faction.id,
      factionSlug: faction.slug,
      faction,
      dataVersion: dataVersion ?? null,
      items: [],
      points: { current: 0 }
    };

    try {
      await offlineStorage.saveCollection(collection);
      onClose();
      navigate(`/collections/${collection.id}`);
    } catch (error) {
      console.error('Failed to create collection', error);
      showToast({ type: 'error', title: 'Error', message: 'Could not create collection.' });
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={(e) => void handleSubmit(e)}>
      <Field>
        <label htmlFor="collection-name" className="block text-sm font-medium text-body">
          Name
        </label>
        <input
          id="collection-name"
          type="text"
          className="input-base"
          value={name}
          data-testid="collection-name-input"
          onChange={(e) => setName(e.target.value)}
          placeholder="My Collection"
          required
        />
      </Field>

      {factionsLoading ? (
        <FieldSkeleton />
      ) : (
        <SelectField
          label="Faction"
          data-testid="collection-faction-field"
          options={factionOptions}
          value={factionSlug}
          onChange={(e) => {
            setFactionSlug(e.target.value);
            setName((prev) => prev || (e.target.value ? `${e.target.value} collection` : ''));
          }}
          placeholder="Select a Faction"
          required
        />
      )}

      <div className="flex justify-end gap-4">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!name || !factionSlug || factionsLoading}
          data-testid="create-collection-submit"
        >
          Create
        </Button>
      </div>
    </form>
  );
};

/** Bottom sheet for creating a collection; navigates to the new collection on success. */
const CreateCollectionSheet: React.FC<Props> = ({ open, onClose }) => (
  <Sheet
    open={open}
    onClose={onClose}
    title="Create Collection"
    data-testid="create-collection-sheet"
  >
    <CreateCollectionForm onClose={onClose} />
  </Sheet>
);

export default CreateCollectionSheet;
