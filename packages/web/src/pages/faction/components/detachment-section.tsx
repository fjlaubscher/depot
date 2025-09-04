import React from 'react';
import { depot } from '@depot/core';

// UI Components
import Grid from '@/components/ui/grid';
import { CollapsibleSection } from '@/components/ui';
import DetachmentAbilityCard from './detachment-ability-card';
import EnhancementCard from './enhancement-card';
import StratagemCard from '@/components/shared/stratagem-card';

interface DetachmentSectionProps {
  detachmentName: string;
  abilities: depot.DetachmentAbility[];
  enhancements: depot.Enhancement[];
  stratagems: depot.Stratagem[];
}

const DetachmentSection: React.FC<DetachmentSectionProps> = ({
  detachmentName,
  abilities,
  enhancements,
  stratagems
}) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-wide">
          {detachmentName}
        </h3>
      </div>

      <div className="flex flex-col">
        {/* Detachment Abilities - rendered directly with padding */}
        {abilities.length > 0 && (
          <div className="p-6">
            <Grid>
              {abilities.map((ability) => (
                <DetachmentAbilityCard key={ability.id} ability={ability} />
              ))}
            </Grid>
          </div>
        )}

        {/* Enhancements - full width */}
        {enhancements.length > 0 && (
          <CollapsibleSection
            title="Enhancements"
            defaultExpanded={false}
            className="border-t border-gray-200 dark:border-gray-700"
          >
            <Grid>
              {enhancements.map((enhancement) => (
                <EnhancementCard key={enhancement.id} enhancement={enhancement} />
              ))}
            </Grid>
          </CollapsibleSection>
        )}

        {/* Stratagems - full width */}
        {stratagems.length > 0 && (
          <CollapsibleSection
            title="Stratagems"
            defaultExpanded={false}
            className="border-t border-gray-200 dark:border-gray-700"
          >
            <Grid>
              {stratagems.map((stratagem) => (
                <StratagemCard key={stratagem.id} stratagem={stratagem} />
              ))}
            </Grid>
          </CollapsibleSection>
        )}
      </div>
    </div>
  );
};

export default DetachmentSection;
