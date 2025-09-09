import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { depot } from '@depot/core';
import Card from '@/components/ui/card';
import { getAbilityTypeBadge } from '../utils/abilities';

interface ExpandableAbilityCardProps {
  ability: depot.Ability;
}

const ExpandableAbilityCard: React.FC<ExpandableAbilityCardProps> = ({ ability }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const badge = getAbilityTypeBadge(ability.type);

  return (
    <Card className="p-4 h-full">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h5 className="font-semibold text-gray-900 dark:text-white">{ability.name}</h5>
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color} shrink-0`}
        >
          {badge.text}
        </span>
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors mb-3 cursor-pointer"
        aria-expanded={isExpanded}
        aria-controls={`ability-${ability.id}-description`}
      >
        {isExpanded ? (
          <>
            <FaChevronUp className="w-3 h-3" />
            Hide Details
          </>
        ) : (
          <>
            <FaChevronDown className="w-3 h-3" />
            Show Details
          </>
        )}
      </button>

      {isExpanded && (
        <div
          id={`ability-${ability.id}-description`}
          className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed border-t border-gray-200 dark:border-gray-700 pt-3"
          dangerouslySetInnerHTML={{ __html: ability.description }}
        />
      )}
    </Card>
  );
};

export default ExpandableAbilityCard;
