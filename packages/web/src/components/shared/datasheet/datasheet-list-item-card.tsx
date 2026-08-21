import type { FC } from 'react';
import Tag from '@/components/ui/tag';
import { LinkCard } from '@/components/ui';
import type { DatasheetListItem } from '@depot/core/utils/datasheets';
import {
  CODEX_SLUG,
  buildSupplementLabel,
  getSupplementKey,
  isSupplementEntry
} from '@depot/core/utils/datasheets';
import { getSupplementStyles } from '@/utils/supplement-styles';

interface DatasheetListItemCardProps {
  datasheet: DatasheetListItem;
  supplementMetadataHasSupplements?: boolean;
}

const DatasheetListItemCard: FC<DatasheetListItemCardProps> = ({
  datasheet,
  supplementMetadataHasSupplements = false
}) => {
  const showSupplement = supplementMetadataHasSupplements && isSupplementEntry(datasheet);
  const supplementKey = getSupplementKey(datasheet);
  const hasTags =
    datasheet.isSupport || showSupplement || datasheet.isLegends || datasheet.isForgeWorld;

  return (
    <LinkCard to={`/faction/${datasheet.factionSlug}/datasheet/${datasheet.slug}`} showArrow>
      <div className="flex flex-col gap-2">
        <span className="font-medium text-foreground transition-colors duration-200 group-hover/link:text-accent">
          {datasheet.name}
        </span>
        {hasTags ? (
          <div className="flex flex-wrap items-center gap-2 text-sm text-subtle">
            {datasheet.isSupport ? (
              <Tag size="sm" variant="secondary">
                Support
              </Tag>
            ) : null}
            {showSupplement ? (
              <Tag
                size="sm"
                variant="default"
                className={getSupplementStyles(supplementKey).tagClass}
                data-supplement-key={supplementKey}
              >
                {datasheet.supplementLabel ||
                  buildSupplementLabel(
                    datasheet.supplementSlug ?? CODEX_SLUG,
                    datasheet.supplementName
                  )}
              </Tag>
            ) : null}
            {datasheet.isLegends ? (
              <Tag size="sm" variant="warning">
                Warhammer Legends
              </Tag>
            ) : null}
            {datasheet.isForgeWorld ? (
              <Tag size="sm" variant="secondary">
                Forge World
              </Tag>
            ) : null}
          </div>
        ) : null}
      </div>
    </LinkCard>
  );
};

export default DatasheetListItemCard;
