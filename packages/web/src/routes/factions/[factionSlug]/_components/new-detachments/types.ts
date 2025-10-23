export type DetachmentSectionKey = 'abilities' | 'enhancements' | 'stratagems';

export interface DetachmentSection {
  key: DetachmentSectionKey;
  label: string;
  disabled?: boolean;
}
