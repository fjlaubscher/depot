import type { FC, ReactNode } from 'react';
import { Crown } from 'lucide-react';
import { cx } from '@/utils/cx';
import type { depot } from '@depot/core';
import { Card, Tag } from '@/components/ui';
import { COLLECTION_STATE_META } from '@/utils/collection';
import { getWargearBaseName } from '@depot/core/utils/wargear';
import { formatAbilityName } from '@depot/core/utils/abilities';

interface RosterUnitCardCompactProps {
  id?: string;
  unit: depot.RosterUnit;
  actions?: ReactNode;
  children?: ReactNode;
  onClick?: () => void;
  state?: depot.CollectionUnitState;
  dataTestId?: string;
  showWargearSummary?: boolean;
  className?: string;
  isWarlord?: boolean;
  enhancementName?: string;
  /** Legality problems attributed to this unit; renders the invalid treatment. */
  issues?: string[];
}

const RosterUnitCardCompact: FC<RosterUnitCardCompactProps> = ({
  id,
  unit,
  actions,
  children,
  onClick,
  state,
  dataTestId,
  showWargearSummary = true,
  className,
  isWarlord = false,
  enhancementName,
  issues = []
}) => {
  const unitPoints = parseInt(unit.modelCost.cost, 10) || 0;

  // A single model is the default, so saying so is noise. Anything else — a real
  // count or an odd description like "per Dark lance" — still earns its place.
  const modelCount = unit.modelCost.description?.trim();
  const showModelCount = Boolean(modelCount) && !/^1 model$/i.test(modelCount!);
  const stateMeta = state ? COLLECTION_STATE_META[state] : null;

  // One truncated line beats a wrap of chips — the loadout is a reminder, not a
  // control. Base names only: listing every profile turns one weapon into
  // "plasma pistol – standard · plasma pistol – supercharge" and buries the rest.
  const loadout = [
    ...new Set([
      ...unit.selectedWargear.map((w) => getWargearBaseName(w.name).toLowerCase()),
      ...(unit.selectedWargearAbilities ?? []).map((a) => formatAbilityName(a).toLowerCase())
    ])
  ].join(' · ');

  return (
    <Card
      id={id}
      padding="sm"
      className={cx(
        // min-w-0 so a long loadout line truncates instead of stretching the
        // grid track it sits in.
        'relative flex h-full min-w-0 flex-col gap-1.5',
        onClick && 'cursor-pointer',
        issues.length > 0 && 'border-l-2 border-l-danger-fg',
        className
      )}
      onClick={onClick}
      data-testid={dataTestId}
      data-state={state}
    >
      <div className="flex items-start gap-2.5">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-1">
            {isWarlord ? (
              <span
                role="img"
                aria-label="Warlord"
                title="Warlord"
                className="mr-1 shrink-0 text-accent"
                data-testid="unit-warlord-tag"
              >
                <Crown size={14} aria-hidden />
              </span>
            ) : null}
            {unit.datasheet.isForgeWorld ? (
              <Tag
                variant="secondary"
                size="sm"
                className="mr-1"
                data-testid="unit-forge-world-tag"
              >
                Forge World
              </Tag>
            ) : null}
            {unit.datasheet.isLegends ? (
              <Tag variant="warning" size="sm" className="mr-1" data-testid="unit-legends-tag">
                Legends
              </Tag>
            ) : null}
            <h3 className="text-[13.5px] leading-tight font-bold text-foreground">
              {unit.datasheet.name}
            </h3>
            {showModelCount ? (
              <span className="ml-1 font-mono text-[11px] font-medium text-muted">
                {modelCount}
              </span>
            ) : null}
            {issues.length > 0 ? (
              <Tag variant="danger" size="sm" data-testid="unit-invalid-tag">
                Invalid
              </Tag>
            ) : null}
          </div>

          {showWargearSummary && loadout ? (
            <p className="truncate text-[11px] leading-snug text-muted" data-testid="unit-loadout">
              {loadout}
            </p>
          ) : null}

          {enhancementName ? (
            <div className="mt-0.5">
              <Tag variant="primary" size="sm" data-testid="unit-enhancement-tag">
                {enhancementName}
              </Tag>
            </div>
          ) : null}

          {issues.length > 0 ? (
            <ul
              className="flex flex-col gap-0.5 text-[11px] text-danger-fg"
              data-testid="unit-issues"
            >
              {issues.map((issue, index) => (
                <li key={`unit-issue-${index}`}>{issue}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <span
          className="shrink-0 font-mono text-[12.5px] leading-none font-bold text-foreground"
          data-testid="unit-points"
        >
          {unitPoints}
        </span>
      </div>

      {children ? <Card.Content>{children}</Card.Content> : null}

      {stateMeta || actions ? (
        <div className="mt-auto flex items-center justify-between gap-2">
          {stateMeta ? (
            <Tag variant={stateMeta.variant} size="sm" className="whitespace-nowrap">
              {stateMeta.label}
            </Tag>
          ) : (
            <span />
          )}
          {actions ? <div className="flex items-center gap-1">{actions}</div> : null}
        </div>
      ) : null}
    </Card>
  );
};

export default RosterUnitCardCompact;
