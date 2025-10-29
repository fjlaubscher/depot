import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { depot } from '@depot/core';

import { IconButton, Tag } from '@/components/ui';
import { getAbilityTagVariant, getAbilityTypeBadge } from '@/utils/abilities';

interface AbilityModalProps {
  ability: depot.Ability | null;
  open: boolean;
  onClose: () => void;
}

const AbilityModal: React.FC<AbilityModalProps> = ({ ability, open, onClose }) => {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.classList.add('overflow-hidden');

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('overflow-hidden');
    };
  }, [open, onClose]);

  if (!open || !ability) {
    return null;
  }

  const badge = getAbilityTypeBadge(ability.type);
  const tagVariant = getAbilityTagVariant(ability.type);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ability-modal-title"
      data-testid="ability-modal"
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        aria-hidden="true"
      />
      <div
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800">
          <div className="flex flex-col gap-2">
            <h2
              id="ability-modal-title"
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              {ability.name}
            </h2>
            <Tag variant={tagVariant} size="sm" className="self-start cursor-default">
              {badge.text}
            </Tag>
          </div>
          <IconButton
            aria-label="Close ability details"
            variant="ghost"
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            data-testid="ability-modal-close"
          >
            <X size={18} />
          </IconButton>
        </div>
        <div className="flex max-h-[75vh] flex-col gap-4 overflow-y-auto p-4 text-sm leading-relaxed text-body">
          {ability.legend ? (
            <div className="text-muted italic font-medium">{ability.legend}</div>
          ) : null}
          <div dangerouslySetInnerHTML={{ __html: ability.description }} />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AbilityModal;
