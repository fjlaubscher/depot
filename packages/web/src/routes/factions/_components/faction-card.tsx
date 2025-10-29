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
      className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
    >
      <Card interactive className="h-full overflow-hidden">
        <div className="flex h-full flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-foreground transition-colors duration-200 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                {faction.name}
              </h3>
              <p className="text-xs text-muted transition-colors duration-200 group-hover:text-foreground dark:group-hover:text-gray-200">
                Open faction overview, datasheets, detachments, and rules.
              </p>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-muted transition-colors duration-200 group-hover:bg-gray-300 group-hover:text-foreground dark:bg-gray-800 dark:text-gray-300 dark:group-hover:bg-gray-700">
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left">
            {stats.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex flex-col gap-2 rounded-lg border border-subtle bg-white p-3 transition-colors duration-200 group-hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900/40 dark:group-hover:border-gray-700"
              >
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-subtle">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-muted dark:bg-gray-800 dark:text-gray-200">
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span>{label}</span>
                </div>
                <span className="text-xl font-semibold text-foreground tabular-nums">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default FactionCard;
