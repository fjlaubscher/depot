import React from 'react';
import type { depot } from '@depot/core';
import Card from '@/components/ui/card';
import Tag from '@/components/ui/tag';

interface EnhancementCardProps {
  enhancement: depot.Enhancement;
}

const EnhancementCard: React.FC<EnhancementCardProps> = ({ enhancement }) => {
  return (
    <Card className="p-4 space-y-2 h-full border-l-2 border-l-success-fg">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h3 className="font-bold text-foreground text-base leading-tight">{enhancement.name}</h3>
          {enhancement.upgrade ? (
            <Tag variant="primary" size="sm" className="type-label uppercase">
              Upgrade
            </Tag>
          ) : null}
        </div>
        {enhancement.cost ? (
          <div className="flex flex-shrink-0 items-center gap-1">
            <span className="type-stat">{enhancement.cost}</span>
            <span className="type-label">pts</span>
          </div>
        ) : null}
      </div>

      {enhancement.legend ? (
        <div className="ShowFluff text-sm text-muted font-medium italic">{enhancement.legend}</div>
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
