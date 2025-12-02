import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, FileText, Flag } from 'lucide-react';
import type { depot } from '@depot/core';
import { Card, Tag } from '@/components/ui';

interface FactionCardProps {
  faction: depot.Index;
}

const FactionCard: React.FC<FactionCardProps> = ({ faction }) => {
  const stats = [
    {
      label: 'Datasheets',
      value: faction.datasheetCount ?? 0,
      icon: FileText
    },
    {
      label: 'Detachments',
      value: faction.detachmentCount ?? 0,
      icon: Flag
    }
  ];

  return (
    <Link
      to={`/faction/${faction.slug}`}
      className="group block h-full focus-ring-primary focus-visible:outline-offset-4"
    >
      <Card interactive className="flex h-full flex-col gap-4 overflow-hidden">
        <Card.Header className="items-start gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Card.Title
              as="h3"
              className="truncate text-base font-semibold sm:text-lg transition-colors duration-200 group-hover:text-accent"
            >
              {faction.name}
            </Card.Title>
            <Card.Description className="text-xs transition-colors duration-200 group-hover:text-body sm:text-sm">
              View datasheets, detachments, and rules.
            </Card.Description>
          </div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full surface-soft text-muted transition-colors duration-200 group-hover:surface-accent group-hover:text-accent-strong">
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </Card.Header>

        <Card.Content className="flex flex-wrap items-center gap-2 text-sm text-subtle">
          {stats.map(({ label, value, icon: Icon }) => (
            <Tag
              key={label}
              size="sm"
              variant="default"
              className="inline-flex items-center gap-2 text-foreground"
            >
              <Icon className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
              <span className="font-semibold tabular-nums">{value}</span>
              <span className="text-xs uppercase tracking-wide text-muted">{label}</span>
            </Tag>
          ))}
        </Card.Content>
      </Card>
    </Link>
  );
};

export default FactionCard;
