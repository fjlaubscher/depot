import type { depot } from '@depot/core';
import { formatDetachmentOptionLabel } from '@/utils/datasheet-supplements';

export interface DetachmentOption {
  value: string;
  label: string;
}

export const buildDetachmentOptions = (detachments: depot.Detachment[]): DetachmentOption[] =>
  detachments
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((detachment) => ({
      value: detachment.slug,
      label: formatDetachmentOptionLabel(
        detachment.name,
        detachment.supplementKey,
        detachment.supplementLabel
      )
    }));

export default buildDetachmentOptions;
