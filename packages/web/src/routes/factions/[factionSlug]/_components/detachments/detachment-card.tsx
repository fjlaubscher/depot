import React, { useEffect, useMemo, useState } from 'react';
import type { depot } from '@depot/core';
import Tag from '@/components/ui/tag';
import { useSettingsContext } from '@/contexts/settings/use-settings-context';
import { formatChapterDpLine } from '@depot/core/utils/detachments';
import DetachmentAccordion from './detachment-accordion';
import DetachmentPillNav from './detachment-pill-nav';
import DetachmentSectionContent from './detachment-section-content';
import type { DetachmentSectionKey } from './types';

interface DetachmentCardProps {
  detachment: depot.Detachment;
  isOpen: boolean;
  onToggle: () => void;
}

const DetachmentCard: React.FC<DetachmentCardProps> = ({ detachment, isOpen, onToggle }) => {
  const { settings } = useSettingsContext();
  const showFluff = settings.showFluff ?? true;
  const { abilities, enhancements, stratagems } = detachment;

  const initialSection: DetachmentSectionKey = useMemo(() => {
    if (abilities.length > 0) return 'abilities';
    if (enhancements.length > 0) return 'enhancements';
    return 'stratagems';
  }, [abilities.length, enhancements.length, stratagems.length]);

  const [activeSection, setActiveSection] = useState<DetachmentSectionKey>(initialSection);

  const sections = useMemo(
    () => [
      {
        key: 'abilities' as const,
        label: 'Abilities',
        disabled: abilities.length === 0
      },
      {
        key: 'enhancements' as const,
        label: 'Enhancements',
        disabled: enhancements.length === 0
      },
      {
        key: 'stratagems' as const,
        label: 'Stratagems',
        disabled: stratagems.length === 0
      }
    ],
    [abilities.length, enhancements.length, stratagems.length]
  );

  useEffect(() => {
    const currentSection = sections.find((section) => section.key === activeSection);
    if (currentSection && !currentSection.disabled) {
      return;
    }

    const fallbackSection = sections.find((section) => !section.disabled)?.key ?? 'abilities';
    if (fallbackSection !== activeSection) {
      setActiveSection(fallbackSection);
    }
  }, [sections, activeSection]);

  const handleSectionChange = (key: DetachmentSectionKey) => {
    const target = sections.find((section) => section.key === key && !section.disabled);
    if (!target) {
      return;
    }
    setActiveSection(target.key);
  };

  const chapterDpLine =
    detachment.chapterDp.length > 0 ? formatChapterDpLine(detachment.chapterDp) : '';

  return (
    <DetachmentAccordion title={detachment.name} isOpen={isOpen} onToggle={onToggle}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
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
          {chapterDpLine ? (
            <p className="text-xs text-subtle" data-testid="detachment-chapter-dp">
              {chapterDpLine}
            </p>
          ) : null}
          {showFluff && detachment.legend ? (
            <div
              className="text-sm text-muted italic"
              data-testid="detachment-legend"
              dangerouslySetInnerHTML={{ __html: detachment.legend }}
            />
          ) : null}
        </div>

        <DetachmentPillNav
          sections={sections}
          activeKey={activeSection}
          onChange={handleSectionChange}
        />

        <div className="flex flex-col gap-4">
          <DetachmentSectionContent
            abilities={abilities}
            enhancements={enhancements}
            stratagems={stratagems}
            activeKey={activeSection}
          />
        </div>
      </div>
    </DetachmentAccordion>
  );
};

export default DetachmentCard;
