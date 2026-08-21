import type { FC, ReactNode } from 'react';
import { cx } from '@/utils/cx';
import type { depot } from '@depot/core';
import { Card, Tag, TagGroup } from '@/components/ui';
import { COLLECTION_STATE_META } from '@/utils/collection';
import { formatWargearDisplayName } from '@depot/core/utils/wargear';
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
  /** Legality problems attributed to this unit; renders the illegal treatment. */
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
  const wargearToDisplay = unit.selectedWargear.slice(0, 3);
  const remainingWargearCount = unit.selectedWargear.length - wargearToDisplay.length;
  const wargearAbilities = unit.selectedWargearAbilities ?? [];
  const wargearAbilitiesToDisplay = wargearAbilities.slice(0, 3);
  const remainingWargearAbilities = wargearAbilities.length - wargearAbilitiesToDisplay.length;
  const stateMeta = state ? COLLECTION_STATE_META[state] : null;

  return (
    <Card
      id={id}
      padding="sm"
      className={cx(
        'relative flex h-full flex-col gap-2',
        onClick && 'cursor-pointer',
        issues.length > 0 && 'border-l-2 border-l-danger-fg',
        className
      )}
      onClick={onClick}
      data-testid={dataTestId}
      data-state={state}
    >
      <Card.Header className="items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Card.Title as="h3" className="truncate text-sm font-semibold">
            {unit.datasheet.name}
          </Card.Title>
          {unit.modelCost.description ? (
            <Card.Subtitle as="span" className="truncate text-xs">
              {unit.modelCost.description}
            </Card.Subtitle>
          ) : null}
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <span className="type-stat whitespace-nowrap" data-testid="unit-points">
            {unitPoints}
          </span>
          <span className="type-label">pts</span>
        </div>
      </Card.Header>

      {isWarlord || enhancementName || issues.length > 0 ? (
        <TagGroup spacing="sm" className="gap-1">
          {isWarlord ? (
            <Tag
              size="sm"
              className="border-transparent bg-accent-600 text-accent-ink dark:bg-accent-500"
              data-testid="unit-warlord-tag"
            >
              Warlord
            </Tag>
          ) : null}
          {enhancementName ? (
            <Tag variant="primary" size="sm" data-testid="unit-enhancement-tag">
              {enhancementName}
            </Tag>
          ) : null}
          {issues.length > 0 ? (
            <Tag variant="danger" size="sm" data-testid="unit-illegal-tag">
              Illegal
            </Tag>
          ) : null}
        </TagGroup>
      ) : null}

      {issues.length > 0 ? (
        <ul className="flex flex-col gap-0.5 text-xs text-danger-fg" data-testid="unit-issues">
          {issues.map((issue, index) => (
            <li key={`unit-issue-${index}`}>{issue}</li>
          ))}
        </ul>
      ) : null}

      {showWargearSummary && unit.selectedWargear.length > 0 ? (
        <Card.Content className="pt-0">
          <TagGroup spacing="sm" className="gap-1">
            {wargearToDisplay.map((wargear, index) => (
              <Tag key={`compact-wargear-${index}`} size="sm" className="capitalize">
                {formatWargearDisplayName(wargear).toLowerCase()}
              </Tag>
            ))}
            {remainingWargearCount > 0 ? (
              <Tag variant="default" size="sm">
                +{remainingWargearCount} more
              </Tag>
            ) : null}
          </TagGroup>
        </Card.Content>
      ) : null}

      {showWargearSummary && wargearAbilities.length > 0 ? (
        <Card.Content className="pt-0">
          <TagGroup spacing="sm" className="gap-1">
            {wargearAbilitiesToDisplay.map((ability, index) => (
              <Tag
                key={`compact-wargear-ability-${index}`}
                size="sm"
                variant="warning"
                className="capitalize"
              >
                {formatAbilityName(ability).toLowerCase()}
              </Tag>
            ))}
            {remainingWargearAbilities > 0 ? (
              <Tag variant="default" size="sm">
                +{remainingWargearAbilities} more
              </Tag>
            ) : null}
          </TagGroup>
        </Card.Content>
      ) : null}

      {children ? <Card.Content>{children}</Card.Content> : null}

      {stateMeta || actions ? (
        <Card.Footer className="mt-auto flex items-center justify-between gap-2">
          <div className="flex flex-1 items-center gap-2">
            {stateMeta ? (
              <Tag variant={stateMeta.variant} size="sm" className="whitespace-nowrap">
                {stateMeta.label}
              </Tag>
            ) : null}
          </div>
          {actions ? <div className="flex items-center gap-1">{actions}</div> : null}
        </Card.Footer>
      ) : null}
    </Card>
  );
};

export default RosterUnitCardCompact;
