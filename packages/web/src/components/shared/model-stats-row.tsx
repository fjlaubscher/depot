import React from 'react';
import type { depot } from '@depot/core';
import { Shield } from 'lucide-react';

import { StatCard, StatsRow } from '@/components/ui';

interface ModelStatsRowProps {
  model: depot.Model;
  variant?: 'default' | 'compact';
}

const ModelStatsRow: React.FC<ModelStatsRowProps> = ({ model, variant = 'default' }) => {
  const statCardSize = variant === 'compact' ? 'compact' : 'default';
  const normalizedInv = normalizeInvulnerable(model.invSv);
  const showInvulnerable = Boolean(normalizedInv);

  return (
    <div className="flex flex-col gap-2">
      <StatsRow title={model.name} subtitle={model.baseSize} variant={variant}>
        <StatCard label="M" value={model.m} size={statCardSize} />
        <StatCard label="T" value={model.t} size={statCardSize} />
        <StatCard label="Sv" value={model.sv} size={statCardSize} />
        <StatCard label="W" value={model.w} size={statCardSize} />
        <StatCard label="Ld" value={model.ld} size={statCardSize} />
        <StatCard label="OC" value={model.oc} size={statCardSize} />
      </StatsRow>

      {showInvulnerable ? (
        <div
          className={`flex items-center gap-2 text-foreground ${
            variant === 'compact' ? 'text-xs' : 'text-sm'
          }`}
          data-testid="model-invulnerable-save"
        >
          <Shield size={variant === 'compact' ? 14 : 16} className="text-subtle" />
          <span className="font-medium">Invulnerable Save</span>{' '}
          <span className="font-bold text-primary-500">{normalizedInv}</span>
          {model.invSvDescr ? (
            <span className="text-subtle">({model.invSvDescr.trim()})</span>
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
