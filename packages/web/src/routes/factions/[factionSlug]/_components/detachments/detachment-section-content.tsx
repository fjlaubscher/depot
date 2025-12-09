import React, { useMemo } from 'react';
import type { depot } from '@depot/core';
import StratagemCard from '@/components/shared/stratagem-card';
import EnhancementCard from '../enhancement-card';
import DetachmentAbilityCard from '../detachment-ability-card';
import type { DetachmentSectionKey } from './types';
import { sortByName } from '@depot/core/utils/common';

interface DetachmentSectionContentProps {
  abilities: depot.DetachmentAbility[];
  enhancements: depot.Enhancement[];
  stratagems: depot.Stratagem[];
  activeKey: DetachmentSectionKey;
}

const DetachmentSectionContent: React.FC<DetachmentSectionContentProps> = ({
  abilities,
  enhancements,
  stratagems,
  activeKey
}) => {
  const sortedAbilities = useMemo(() => sortByName(abilities), [abilities]);
  const sortedEnhancements = useMemo(() => sortByName(enhancements), [enhancements]);
  const sortedStratagems = useMemo(() => sortByName(stratagems), [stratagems]);

  const renderEmpty = (label: string) => (
    <div className="text-sm text-subtle">No {label} available for this detachment.</div>
  );

  if (activeKey === 'abilities') {
    if (sortedAbilities.length === 0) {
      return renderEmpty('abilities');
    }

    return sortedAbilities.map((ability) => (
      <DetachmentAbilityCard key={ability.id} ability={ability} />
    ));
  }

  if (activeKey === 'enhancements') {
    if (sortedEnhancements.length === 0) {
      return renderEmpty('enhancements');
    }

    return sortedEnhancements.map((enhancement) => (
      <EnhancementCard key={enhancement.id} enhancement={enhancement} />
    ));
  }

  if (activeKey === 'stratagems') {
    if (sortedStratagems.length === 0) {
      return renderEmpty('stratagems');
    }

    return sortedStratagems.map((stratagem) => (
      <StratagemCard key={stratagem.id} stratagem={stratagem} />
    ));
  }

  return null;
};

export default DetachmentSectionContent;
