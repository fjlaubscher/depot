import React from 'react';
import { useTranslation } from 'react-i18next';
import type { depot } from '@depot/core';
import { Shield } from 'lucide-react';

import { StatCard, StatsRow } from '@/components/ui';

interface ModelStatsRowProps {
  model: depot.Model;
}

const ModelStatsRow: React.FC<ModelStatsRowProps> = ({ model }) => {
  const { t } = useTranslation('catalog');
  const normalizedInv = normalizeInvulnerable(model.invSv);
  const showInvulnerable = Boolean(normalizedInv);

  return (
    <div className="flex flex-col gap-2">
      <StatsRow title={model.name} subtitle={model.baseSize}>
        <StatCard label={t('stats.movement')} value={model.m} />
        <StatCard label={t('stats.toughness')} value={model.t} />
        <StatCard label={t('stats.save')} value={model.sv} />
        <StatCard label={t('stats.wounds')} value={model.w} />
        <StatCard label={t('stats.leadership')} value={model.ld} />
        <StatCard label={t('stats.objectiveControl')} value={model.oc} />
      </StatsRow>

      {showInvulnerable ? (
        <div className="flex flex-col">
          <div
            className="flex items-center gap-2 text-sm text-foreground"
            data-testid="model-invulnerable-save"
          >
            <Shield size={16} className="text-subtle" />
            <span className="font-medium">{t('stats.invulnerableSave')}</span>{' '}
            <span className="font-bold text-accent-500">{normalizedInv}</span>
          </div>
          {model.invSvDescr ? (
            <span className="text-subtle text-xs" data-testid="model-invulnerable-save-description">
              {model.invSvDescr.trim()}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

const normalizeInvulnerable = (value?: string): string => {
  if (!value) {
    return '';
  }

  const sanitized = value.trim();
  if (sanitized === '' || sanitized === '-' || sanitized === '0') {
    return '';
  }

  const withoutMarkers = sanitized.replace(/\*+$/, '');
  if (withoutMarkers.endsWith('+') || /(\+\+|")$/.test(withoutMarkers)) {
    return withoutMarkers;
  }

  return `${withoutMarkers}+`;
};

export default ModelStatsRow;
