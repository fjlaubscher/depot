import React, { useMemo, useState } from 'react';
import type { depot } from '@depot/core';

// UI Components
import { Filters, Grid, LinkCard, Search, SelectField, Tag } from '@/components/ui';

// Hooks
import useDebounce from '@/hooks/use-debounce';
import useSelect from '@/hooks/use-select';

// Utils
import { sortByName } from '@depot/core/utils/common';
import { formatChapterDpLine } from '@depot/core/utils/detachments';

interface FactionDetachmentsProps {
  factionSlug: string;
  detachments: depot.Detachment[];
}

/** Boarding Actions detachments carry a `type` instead of a force disposition. */
const dispositionOf = (detachment: depot.Detachment): string =>
  detachment.forceDisposition || detachment.type;

const FactionDetachments: React.FC<FactionDetachmentsProps> = ({ factionSlug, detachments }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce<string>(query, 100);

  const dispositions = useMemo(
    () => [...new Set(detachments.map(dispositionOf).filter(Boolean))].sort(),
    [detachments]
  );
  const { description: disposition, value, onChange, options } = useSelect(dispositions);

  const filtered = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    return sortByName(
      detachments.filter(
        (detachment) =>
          (value === 0 || dispositionOf(detachment) === disposition) &&
          (!needle || detachment.name.toLowerCase().includes(needle))
      )
    );
  }, [detachments, debouncedQuery, disposition, value]);

  if (detachments.length === 0) {
    return (
      <div className="py-12 text-center text-subtle" data-testid="faction-detachments">
        No detachments available for this faction.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" data-testid="faction-detachments">
      <Filters
        showClear={value !== 0 || !!query}
        onClear={() => {
          setQuery('');
          onChange(0);
        }}
      >
        <Search
          label="Search by name"
          placeholder="Search detachments by name..."
          value={query}
          onChange={setQuery}
          testId="detachment-search"
        />
        <SelectField
          name="disposition"
          value={value}
          label="Filter by force disposition"
          onChange={(e) => onChange(Number(e.target.value))}
          options={options}
        />
      </Filters>

      <Grid>
        {filtered.map((detachment) => (
          <LinkCard
            key={detachment.id || detachment.slug}
            to={`/faction/${factionSlug}/detachment/${detachment.slug}`}
            showArrow
            data-testid="detachment-card"
          >
            <div className="flex flex-col gap-2">
              <span className="font-medium text-foreground transition-colors duration-200 group-hover/link:text-accent">
                {detachment.name}
              </span>
              <DetachmentMeta detachment={detachment} />
            </div>
          </LinkCard>
        ))}
      </Grid>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-subtle">
          No detachments found matching your search criteria.
        </div>
      ) : null}
    </div>
  );
};

export const DetachmentMeta: React.FC<{ detachment: depot.Detachment }> = ({ detachment }) => {
  const chapterDpLine = formatChapterDpLine(detachment.chapterDp);
  const hasTags = detachment.dp || detachment.forceDisposition || detachment.type;
  if (!hasTags && !chapterDpLine) return null;

  return (
    <div className="flex flex-col gap-1">
      {hasTags ? (
        <div className="flex flex-wrap items-center gap-2" data-testid="detachment-meta">
          {detachment.dp ? (
            <Tag size="sm" variant="primary">
              {detachment.dp} DP
            </Tag>
          ) : null}
          {detachment.forceDisposition ? (
            <Tag size="sm" variant="default">
              {detachment.forceDisposition}
            </Tag>
          ) : null}
          {detachment.type ? (
            <Tag size="sm" variant="secondary">
              {detachment.type}
            </Tag>
          ) : null}
        </div>
      ) : null}
      {chapterDpLine ? (
        <p className="text-xs text-subtle" data-testid="detachment-chapter-dp">
          {chapterDpLine}
        </p>
      ) : null}
    </div>
  );
};

export default FactionDetachments;
