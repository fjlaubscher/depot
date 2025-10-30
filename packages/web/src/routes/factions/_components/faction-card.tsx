import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, FileText, Flag } from 'lucide-react';
import type { depot } from '@depot/core';
import { Card } from '@/components/ui';

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
        <Card.Header className="items-start gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Card.Title as="h3" className="truncate text-base font-semibold sm:text-lg">
              {faction.name}
            </Card.Title>
            <Card.Description className="text-xs transition-colors duration-200 group-hover:text-body sm:text-sm">
              Open faction overview, datasheets, detachments, and rules.
            </Card.Description>
          </div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full surface-soft text-muted transition-colors duration-200 group-hover:surface-accent group-hover:text-accent-strong">
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </Card.Header>

        <Card.Content className="grid grid-cols-2 gap-3 text-left">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex flex-col gap-2 rounded-lg border border-subtle surface-soft p-3 transition-colors duration-200 group-hover:border-accent group-hover:surface-accent"
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full surface-accent text-accent">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span className="truncate">{label}</span>
              </div>
              <span className="text-xl font-semibold text-foreground tabular-nums">{value}</span>
            </div>
          ))}
        </Card.Content>
      </Card>
    </Link>
  );
};

export default FactionCard;
