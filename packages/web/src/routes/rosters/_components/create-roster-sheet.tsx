import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { useNavigate } from '@/lib/navigation';
import type { depot } from '@depot/core';

import useFaction from '@/hooks/use-faction';
import { useFactionsContext } from '@/contexts/factions/context';
import { useRoster } from '@/contexts/roster/context';
import { useToast } from '@/contexts/toast/context';
import { formatRebindSummaryMessage, rebindRosterUnits } from '@/utils/refresh-user-data';
import { sortByName } from '@depot/core/utils/common';

import { Sheet, Field, SelectField, Button, Alert } from '@/components/ui';
import { FieldSkeleton } from '@/components/ui/skeleton';
import MaxPointsField from './max-points-field';

export interface RosterPrefill {
  name?: string;
  factionSlug?: string;
  units?: depot.RosterUnit[];
  collectionId?: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** Units + faction carried over from a collection; locks the faction select. */
  prefill?: RosterPrefill;
}

type Errors = {
  name?: ParseKeys<'rosters'>;
  faction?: ParseKeys<'rosters'>;
  detachment?: ParseKeys<'rosters'>;
  maxPoints?: ParseKeys<'rosters'>;
};

const CreateRosterForm: React.FC<Omit<Props, 'open'>> = ({ onClose, prefill }) => {
  const { t } = useTranslation(['rosters', 'common']);
  const navigate = useNavigate();
  const { createRoster } = useRoster();
  const {
    factionIndex: factions,
    loading: factionsLoading,
    dataVersion,
    getDatasheet,
    getFactionManifest
  } = useFactionsContext();
  const { showToast } = useToast();

  const [name, setName] = useState(prefill?.name ?? '');
  const [factionSlug, setFactionSlug] = useState(prefill?.factionSlug ?? '');
  const [detachmentSlugs, setDetachmentSlugs] = useState<string[]>([]);
  const [maxPoints, setMaxPoints] = useState(2000);
  const [errors, setErrors] = useState<Errors>({});

  const { data: selectedFaction, loading: factionLoading } = useFaction(factionSlug || undefined);
  const factionDetachments: depot.Detachment[] = selectedFaction?.detachments ?? [];
  const prefillUnits = prefill?.units ?? [];
  const prefillTotal = prefillUnits.reduce(
    (acc, unit) => acc + (parseInt(unit.modelCost.cost, 10) || 0),
    0
  );

  const factionOptions = sortByName(factions ?? []).map((f) => ({ value: f.slug, label: f.name }));

  useEffect(() => {
    setDetachmentSlugs([]);
  }, [factionSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Errors = {};
    const selectedFactionIndex = factions?.find((f) => f.slug === factionSlug);

    if (!name.trim()) nextErrors.name = 'form.nameRequired';
    if (!factionSlug) nextErrors.faction = 'form.factionRequired';
    else if (!selectedFactionIndex) nextErrors.faction = 'form.factionMissing';
    if (detachmentSlugs.length === 0) nextErrors.detachment = 'form.detachmentRequired';
    if (maxPoints <= 0) nextErrors.maxPoints = 'form.pointsRequired';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !selectedFactionIndex) return;

    let units = prefillUnits;
    if (units.length > 0 && dataVersion) {
      const rebound = await rebindRosterUnits(
        units,
        selectedFactionIndex.slug,
        getDatasheet,
        getFactionManifest
      );
      units = rebound.units;
      const note = formatRebindSummaryMessage(rebound.summary);
      if (note) {
        showToast({ type: 'warning', title: t('notifications.unitsUpdated'), message: note });
      }
    }

    const newId = createRoster({
      name: name.trim(),
      factionId: selectedFactionIndex.id,
      factionSlug: selectedFactionIndex.slug,
      faction: selectedFactionIndex,
      dataVersion: dataVersion ?? null,
      maxPoints,
      detachments: factionDetachments.filter((d) => detachmentSlugs.includes(d.slug)),
      units,
      collectionId: prefill?.collectionId ?? null
    });
    onClose();
    navigate(`/rosters/${newId}/edit`);
  };

  return (
    <form
      data-testid="roster-form"
      onSubmit={(e) => void handleSubmit(e)}
      className="flex flex-col gap-4"
    >
      {prefillUnits.length > 0 ? (
        <Alert title={t('form.prefill', { count: prefillUnits.length })}>
          {t('form.totalPoints', { points: prefillTotal })}
        </Alert>
      ) : null}

      <Field data-testid="roster-name-field">
        <label htmlFor="roster-name" className="block text-sm font-medium text-body">
          {t('form.name')}
        </label>
        <input
          data-testid="roster-name-input"
          id="roster-name"
          type="text"
          className="input-base"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          required
        />
        {errors.name ? <p className="text-sm text-danger-fg">{t(errors.name)}</p> : null}
      </Field>

      {factionsLoading ? (
        <FieldSkeleton />
      ) : (
        <SelectField
          data-testid="faction-field"
          label={t('form.faction')}
          options={factionOptions}
          value={factionSlug}
          onChange={(e) => {
            setFactionSlug(e.target.value);
            setErrors((prev) => ({ ...prev, faction: undefined, detachment: undefined }));
          }}
          placeholder={t('form.selectFaction')}
          required
          disabled={!!prefill?.factionSlug}
          error={errors.faction && t(errors.faction)}
        />
      )}

      {factionLoading ? (
        <FieldSkeleton />
      ) : factionSlug && factionDetachments.length > 0 ? (
        <SelectField
          data-testid="detachment-field"
          label={t('form.detachment')}
          options={sortByName(factionDetachments).map((detachment) => ({
            value: detachment.slug,
            label: detachment.name
          }))}
          value={detachmentSlugs[0] ?? ''}
          onChange={(e) => {
            setDetachmentSlugs(e.target.value ? [e.target.value] : []);
            setErrors((prev) => ({ ...prev, detachment: undefined }));
          }}
          placeholder={t('form.selectDetachment')}
          required
          error={errors.detachment && t(errors.detachment)}
        />
      ) : factionSlug ? (
        <Field>
          <label className="block text-sm font-medium text-body">{t('form.detachment')}</label>
          <div className="text-sm text-subtle italic">{t('form.noDetachments')}</div>
        </Field>
      ) : null}

      <MaxPointsField
        data-testid="max-points-field"
        value={maxPoints}
        onChange={setMaxPoints}
        error={errors.maxPoints && t(errors.maxPoints)}
      />

      <div className="flex justify-end gap-4">
        <Button data-testid="cancel-button" variant="secondary" onClick={onClose}>
          {t('common:actions.cancel')}
        </Button>
        <Button
          data-testid="submit-button"
          type="submit"
          disabled={
            !name ||
            !factionSlug ||
            detachmentSlugs.length === 0 ||
            factionsLoading ||
            factionLoading
          }
        >
          {t('pages.create')}
        </Button>
      </div>
    </form>
  );
};

const CreateRosterSheet: React.FC<Props> = ({ open, onClose, prefill }) => {
  const { t } = useTranslation('rosters');
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t('pages.create')}
      data-testid="create-roster-sheet"
    >
      <CreateRosterForm onClose={onClose} prefill={prefill} />
    </Sheet>
  );
};

export default CreateRosterSheet;
