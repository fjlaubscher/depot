import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import useFactions from '@/hooks/use-factions';
import useFaction from '@/hooks/use-faction';
import { useRoster } from '@/contexts/roster/use-roster-context';
import { offlineStorage } from '@/data/offline-storage';
import type { depot } from '@depot/core';

import AppLayout from '@/components/layout';
import { PageHeader, Card, Field, SelectField, Button, Alert } from '@/components/ui';
import { FieldSkeleton } from '@/components/ui/skeleton';
import MaxPointsField from '@/routes/rosters/_components/max-points-field';

const CreateRoster: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createRoster } = useRoster();

  const [name, setName] = useState('');
  const [factionSlug, setFactionSlug] = useState<string | null>(null);
  const [detachmentSlug, setDetachmentSlug] = useState<string | null>(null);
  const [maxPoints, setMaxPoints] = useState(2000);
  const [prefillUnits, setPrefillUnits] = useState<depot.RosterUnit[]>([]);
  const [errors, setErrors] = useState<{
    name?: string;
    faction?: string;
    detachment?: string;
    maxPoints?: string;
  }>({});

  const { factions, loading: factionsLoading } = useFactions();
  const { data: selectedFaction, loading: factionLoading } = useFaction(factionSlug || undefined);

  const collectionId = searchParams.get('fromCollection');

  const factionOptions =
    factions
      ?.map((f) => ({ value: f.slug, label: f.name }))
      .sort((a, b) => a.label.localeCompare(b.label)) || [];

  const factionDetachments: depot.Detachment[] = selectedFaction?.detachments ?? [];

  const sortedDetachments = useMemo(
    () => [...factionDetachments].sort((a, b) => a.name.localeCompare(b.name)),
    [factionDetachments]
  );

  const detachmentOptions = useMemo(
    () =>
      sortedDetachments.map((detachment) => ({
        value: detachment.slug,
        label: detachment.name
      })),
    [sortedDetachments]
  );

  // Reset detachment when faction changes
  useEffect(() => {
    setDetachmentSlug(null);
  }, [factionSlug]);

  useEffect(() => {
    if (!collectionId) return;

    // Prefer session-stashed selection from collection flow
    const saved = sessionStorage.getItem('collection-roster-prefill');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as {
          collectionId: string;
          factionSlug?: string | null;
          factionId?: string;
          name?: string;
          units: depot.RosterUnit[];
        };

        if (parsed.collectionId === collectionId) {
          if (parsed.factionSlug) setFactionSlug(parsed.factionSlug);
          if (parsed.name) setName((prev) => prev || parsed.name || '');
          setPrefillUnits(parsed.units || []);
          sessionStorage.removeItem('collection-roster-prefill');
          return;
        }
      } catch {
        // fall through
      }
    }

    const loadCollection = async () => {
      const collection = await offlineStorage.getCollection(collectionId);
      if (!collection) return;
      setFactionSlug(collection.factionSlug ?? collection.factionId);
      setName((prev) => prev || `${collection.name} roster`);

      const units: depot.RosterUnit[] = collection.items.map((item) => ({
        id: crypto.randomUUID(),
        datasheet: item.datasheet,
        modelCost: item.modelCost,
        selectedWargear: item.selectedWargear,
        selectedWargearAbilities: item.selectedWargearAbilities,
        datasheetSlug: item.datasheetSlug ?? item.datasheet.slug
      }));
      setPrefillUnits(units);
    };
    void loadCollection();
  }, [collectionId]);

  const prefillTotal = useMemo(() => {
    if (prefillUnits.length === 0) return;

    return prefillUnits.reduce((acc, unit) => acc + parseInt(unit.modelCost.cost, 10) || 0, 0);
  }, [prefillUnits]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};

    if (!name.trim()) {
      nextErrors.name = 'Please enter a roster name.';
    }
    if (!factionSlug) {
      nextErrors.faction = 'Please select a faction.';
    }
    if (!detachmentSlug) {
      nextErrors.detachment = 'Please select a detachment.';
    }
    if (maxPoints <= 0) {
      nextErrors.maxPoints = 'Max points must be greater than 0.';
    }

    // Build the complete detachment object using lookup
    const selectedDetachment = sortedDetachments.find(
      (detachment) => detachment.slug === detachmentSlug
    );
    if (!selectedDetachment) {
      nextErrors.detachment = 'Selected detachment not found.';
    }

    const detachment: depot.Detachment | undefined = selectedDetachment;

    // Find the faction Index entry
    const selectedFactionIndex = factions?.find(
      (f) => f.slug === factionSlug || f.id === factionSlug
    );
    if (!selectedFactionIndex) {
      nextErrors.faction = 'Selected faction not found.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});

    if (!selectedFactionIndex || !detachment) {
      return;
    }

    const newId = createRoster({
      name: name.trim(),
      factionId: selectedFactionIndex.id,
      factionSlug: selectedFactionIndex.slug,
      faction: selectedFactionIndex,
      maxPoints,
      detachment: detachment!,
      units: prefillUnits
    });
    navigate(`/rosters/${newId}/edit`);
  };

  const isFromCollection = !!collectionId && prefillUnits.length > 0;

  return (
    <AppLayout title="Create Roster">
      <div className="flex flex-col gap-4">
        <PageHeader title="Create New Roster" />
        {isFromCollection ? (
          <Alert title={`Prefilling with ${prefillUnits.length} units from your collection.`}>
            Total of {prefillTotal} points
          </Alert>
        ) : null}
        <Card>
          <form data-testid="roster-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field data-testid="roster-name-field">
              <label htmlFor="roster-name" className="block text-sm font-medium text-body">
                Roster Name
              </label>
              <input
                data-testid="roster-name-input"
                id="roster-name"
                type="text"
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-foreground"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors((prev) => ({ ...prev, name: undefined }));
                  }
                }}
                required
              />
              {errors.name ? <p className="text-sm text-danger">{errors.name}</p> : null}
            </Field>

            {factionsLoading ? (
              <FieldSkeleton />
            ) : (
              <SelectField
                data-testid="faction-field"
                label="Faction"
                options={factionOptions}
                value={factionSlug || ''}
                onChange={(e) => {
                  setFactionSlug(e.target.value || null);
                  setErrors((prev) => ({ ...prev, faction: undefined, detachment: undefined }));
                }}
                placeholder="Select a Faction"
                required
                disabled={isFromCollection}
                error={errors.faction}
              />
            )}

            {factionLoading ? (
              <FieldSkeleton />
            ) : factionSlug && detachmentOptions.length > 0 ? (
              <SelectField
                data-testid="detachment-field"
                label="Detachment"
                options={detachmentOptions}
                value={detachmentSlug || ''}
                onChange={(e) => {
                  setDetachmentSlug(e.target.value || null);
                  if (errors.detachment) {
                    setErrors((prev) => ({ ...prev, detachment: undefined }));
                  }
                }}
                placeholder="Select a Detachment"
                required
                error={errors.detachment}
              />
            ) : factionSlug ? (
              <Field>
                <label className="block text-sm font-medium text-body">Detachment</label>
                <div className="text-sm text-subtle italic">
                  No detachments available for this faction
                </div>
              </Field>
            ) : null}

            <MaxPointsField
              data-testid="max-points-field"
              value={maxPoints}
              onChange={setMaxPoints}
              error={errors.maxPoints}
            />

            <div className="flex justify-end gap-4">
              <Button
                data-testid="cancel-button"
                variant="secondary"
                onClick={() => {
                  if (isFromCollection) {
                    navigate(`/collections/${collectionId}`);
                  } else {
                    navigate('/rosters');
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                data-testid="submit-button"
                type="submit"
                disabled={
                  !name || !factionSlug || !detachmentSlug || factionsLoading || factionLoading
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
