import React from 'react';
import type { depot } from '@depot/core';
import Card from '@/components/ui/card';
import Tag from '@/components/ui/tag';
import { useSettingsContext } from '@/contexts/settings/use-settings-context';

interface EnhancementCardProps {
  enhancement: depot.Enhancement;
}

const EnhancementCard: React.FC<EnhancementCardProps> = ({ enhancement }) => {
  const { settings } = useSettingsContext();
  const showFluff = settings.showFluff ?? true;

  return (
    <Card className="p-4 space-y-2 h-full">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h3 className="font-semibold text-foreground text-sm leading-tight">
            {enhancement.name}
          </h3>
          {enhancement.upgrade ? (
            <Tag variant="secondary" size="sm">
              UPGRADE
            </Tag>
          ) : null}
        </div>
        {enhancement.cost ? (
          <Tag variant="success" size="sm">
            {enhancement.cost} pts
          </Tag>
        ) : null}
      </div>

      {showFluff && enhancement.legend ? (
        <div className="text-sm text-muted font-medium italic">{enhancement.legend}</div>
      ) : null}

      <div
        className="text-sm text-body leading-relaxed"
        dangerouslySetInnerHTML={{ __html: enhancement.description }}
      />

      {enhancement.supportLeader ? (
        <div
          className="text-sm text-body leading-relaxed"
          data-testid="enhancement-support-leader"
          dangerouslySetInnerHTML={{ __html: enhancement.supportLeader }}
        />
      ) : null}
    </Card>
  );
};

export default EnhancementCard;
