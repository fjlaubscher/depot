import type { FC, ReactNode } from 'react';
import Tag from '@/components/ui/tag';
import { LinkCard } from '@/components/ui';
import type { DatasheetListItem } from '@/types/datasheets';
import {
  CODEX_SLUG,
  buildSupplementLabel,
  getSupplementKey,
  isSupplementEntry
} from '@depot/core/utils/datasheets';
import { getSupplementStyles } from '@/utils/supplement-styles';

interface DatasheetListItemCardProps {
  datasheet: DatasheetListItem;
  roleLabel?: string | null;
  supplementMetadataHasSupplements?: boolean;
}

const DatasheetListItemCard: FC<DatasheetListItemCardProps> = ({
  datasheet,
  roleLabel,
  supplementMetadataHasSupplements = false
}) => {
  const tags: ReactNode[] = [];

  if (roleLabel) {
    tags.push(
      <Tag key="role" size="sm" variant="default">
        {roleLabel}
      </Tag>
    );
  }

  if (supplementMetadataHasSupplements && isSupplementEntry(datasheet)) {
    const supplementKey = getSupplementKey(datasheet);
    const supplementStyles = getSupplementStyles(supplementKey);
    const label = datasheet.supplementLabel
      ? datasheet.supplementLabel
      : buildSupplementLabel(datasheet.supplementSlug ?? CODEX_SLUG, datasheet.supplementName);
    tags.push(
      <Tag
        key="supplement"
        size="sm"
        variant="default"
        className={supplementStyles.tagClass}
        data-supplement-key={supplementKey}
      >
        {label}
      </Tag>
    );
  }

  if (datasheet.isLegends) {
    tags.push(
      <Tag key="legends" size="sm" variant="warning">
        Warhammer Legends
      </Tag>
    );
  }

  if (datasheet.isForgeWorld) {
    tags.push(
      <Tag key="forgeWorld" size="sm" variant="secondary">
        Forge World
      </Tag>
    );
  }

  return (
    <LinkCard to={`/faction/${datasheet.factionSlug}/datasheet/${datasheet.slug}`} showArrow>
      <div className="flex flex-col gap-2">
        <span className="font-medium text-foreground transition-colors duration-200 group-hover/link:text-accent">
          {datasheet.name}
        </span>
        {tags.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 text-sm text-subtle">{tags}</div>
        ) : null}
      </div>
    </LinkCard>
  );
};

export default DatasheetListItemCard;
