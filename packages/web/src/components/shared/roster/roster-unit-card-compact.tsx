import type { FC, ReactNode } from 'react';
import classNames from 'classnames';
import type { depot } from '@depot/core';
import { Card, PointsTag, Tag, TagGroup } from '@/components/ui';
import { formatWargearDisplayName } from '@/utils/wargear';
import { formatAbilityName } from '@/utils/abilities';

interface RosterUnitCardCompactProps {
  unit: depot.RosterUnit;
  actions?: ReactNode;
  children?: ReactNode;
  onClick?: () => void;
}

const RosterUnitCardCompact: FC<RosterUnitCardCompactProps> = ({
  unit,
  actions,
  children,
  onClick
}) => {
  const unitPoints = parseInt(unit.modelCost.cost, 10) || 0;
  const wargearToDisplay = unit.selectedWargear.slice(0, 3);
  const remainingWargearCount = unit.selectedWargear.length - wargearToDisplay.length;
  const wargearAbilities = unit.selectedWargearAbilities ?? [];
  const wargearAbilitiesToDisplay = wargearAbilities.slice(0, 3);
  const remainingWargearAbilities = wargearAbilities.length - wargearAbilitiesToDisplay.length;

  return (
    <Card
      padding="sm"
      className={classNames('relative flex flex-col gap-2', onClick && 'cursor-pointer')}
      onClick={onClick}
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
          <PointsTag points={unitPoints} className="whitespace-nowrap" />
          {actions ? <div className="flex items-center gap-1">{actions}</div> : null}
        </div>
      </Card.Header>

      {unit.selectedWargear.length > 0 ? (
        <Card.Content className="pt-0">
          <TagGroup spacing="sm" className="gap-1">
            {wargearToDisplay.map((wargear, index) => (
              <Tag
                key={`compact-wargear-${index}`}
                variant="secondary"
                size="sm"
                className="capitalize"
              >
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

      {wargearAbilities.length > 0 ? (
        <Card.Content className="pt-0">
          <TagGroup spacing="sm" className="gap-1">
            {wargearAbilitiesToDisplay.map((ability, index) => (
              <Tag
                key={`compact-wargear-ability-${index}`}
                variant="warning"
                size="sm"
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

      {children ? <Card.Content separated>{children}</Card.Content> : null}
    </Card>
  );
};

export default RosterUnitCardCompact;
