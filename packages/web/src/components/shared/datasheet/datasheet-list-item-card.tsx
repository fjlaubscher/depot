import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Tag from '@/components/ui/tag';
import type { DatasheetListItem } from '@depot/core/utils/datasheets';
import {
  CODEX_SLUG,
  buildSupplementLabel,
  getListItemPoints,
  getSupplementKey,
  isSupplementEntry
} from '@depot/core/utils/datasheets';
import { getSupplementStyles } from '@/utils/supplement-styles';

interface DatasheetListItemCardProps {
  datasheet: DatasheetListItem;
  supplementMetadataHasSupplements?: boolean;
}

/** Dense list row — a faction has ~100 of these, so it reads as a list, not a wall of cards. */
const DatasheetListItemCard: FC<DatasheetListItemCardProps> = ({
  datasheet,
  supplementMetadataHasSupplements = false
}) => {
  const showSupplement = supplementMetadataHasSupplements && isSupplementEntry(datasheet);
  const supplementKey = getSupplementKey(datasheet);

  const points = getListItemPoints(datasheet);
  const meta = [
    datasheet.isSupport ? 'Support' : null,
    datasheet.isLegends ? 'Legends' : null,
    datasheet.isForgeWorld ? 'Forge World' : null
  ].filter(Boolean);

  return (
    <Link
      to={`/faction/${datasheet.factionSlug}/datasheet/${datasheet.slug}`}
      className="group/link flex min-h-11 items-center gap-2.5 px-1 py-2.5 transition-colors hover:bg-surface-muted focus-ring-primary"
      data-testid="link-card"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[13.5px] leading-tight font-bold text-foreground transition-colors group-hover/link:text-accent">
          {datasheet.name}
        </span>
        {meta.length > 0 ? (
          <span className="font-mono text-[9.5px] font-medium uppercase text-subtle">
            {meta.join(' · ')}
          </span>
        ) : null}
      </div>

      {showSupplement ? (
        <Tag
          size="sm"
          variant="default"
          className={getSupplementStyles(supplementKey).tagClass}
          data-supplement-key={supplementKey}
        >
          {datasheet.supplementLabel ||
            buildSupplementLabel(datasheet.supplementSlug ?? CODEX_SLUG, datasheet.supplementName)}
        </Tag>
      ) : null}

      {points ? (
        <span className="shrink-0 font-mono text-[12px] leading-none font-bold text-body">
          {points}
        </span>
      ) : null}

      <ChevronRight size={14} className="shrink-0 text-hint" aria-hidden />
    </Link>
  );
};

export default DatasheetListItemCard;
