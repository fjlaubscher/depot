import React, { useEffect, useMemo, useState } from 'react';
import type { depot } from '@depot/core';
import DetachmentAccordion from './detachment-accordion';
import DetachmentPillNav from './detachment-pill-nav';
import DetachmentSectionContent from './detachment-section-content';
import type { DetachmentSectionKey } from './types';

interface DetachmentCardProps {
  detachmentName: string;
  abilities: depot.DetachmentAbility[];
  enhancements: depot.Enhancement[];
  stratagems: depot.Stratagem[];
  isOpen: boolean;
  onToggle: () => void;
}

const DetachmentCard: React.FC<DetachmentCardProps> = ({
  detachmentName,
  abilities,
  enhancements,
  stratagems,
  isOpen,
  onToggle
}) => {
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

  return (
    <DetachmentAccordion
      title={detachmentName}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="flex flex-col gap-4">
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
