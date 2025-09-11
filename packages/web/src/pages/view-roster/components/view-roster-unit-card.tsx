import type { FC } from 'react';
import { depot } from '@depot/core';
import { Card, StatCard } from '@/components/ui';
import { categorizeAbilities } from '../../datasheet/utils/abilities';

interface ViewRosterUnitCardProps {
  unit: depot.RosterUnit;
}

const ViewRosterUnitCard: FC<ViewRosterUnitCardProps> = ({ unit }) => {
  const unitPoints = parseInt(unit.modelCost.cost, 10) || 0;
  const { inline: inlineAbilities, referenced: referencedAbilities } = categorizeAbilities(
    unit.datasheet.abilities
  );

  return (
    <Card className="print:break-inside-avoid">
      <div className="flex flex-col gap-4">
        {/* Unit Header */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white print:text-black">
              {unit.datasheet.name}
            </h3>
            <span className="text-sm text-gray-600 dark:text-gray-300 print:text-black">
              {unit.modelCost.description}
            </span>
          </div>

          <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 print:bg-gray-100 print:text-black">
            {unitPoints} pts
          </span>
        </div>

        {/* Models Section */}
        {unit.datasheet.models.length > 0 && (
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white print:text-black">
              Models
            </h4>
            <div className="flex flex-col gap-3">
              {unit.datasheet.models.map((model, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-800 print:bg-gray-50 p-3 rounded"
                >
                  <div className="font-medium text-gray-900 dark:text-white print:text-black mb-2">
                    {model.name}
                  </div>
                  <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                    <StatCard label="M" value={`${model.m}"`} />
                    <StatCard label="T" value={model.t} />
                    <StatCard label="Sv" value={`${model.sv}+`} />
                    <StatCard label="W" value={model.w} />
                    <StatCard label="Ld" value={`${model.ld}+`} />
                    <StatCard label="OC" value={model.oc} />
                    {model.invSv && model.invSv !== 'N/A' && (
                      <StatCard label="++Sv" value={`${model.invSv}+`} />
                    )}
                  </div>
                  {/* Display invulnerable save description if present */}
                  {model.invSvDescr && model.invSvDescr !== 'N/A' && (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 print:text-gray-600">
                      <span className="font-medium">Invulnerable Save:</span> {model.invSvDescr}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Keywords Section */}
        {unit.datasheet.keywords.length > 0 && (
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white print:text-black">
              Keywords
            </h4>
            <div className="flex flex-wrap gap-1">
              {unit.datasheet.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 print:bg-gray-100 print:text-black"
                >
                  {keyword.keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Inline Abilities (Unit-specific abilities) */}
        {inlineAbilities.length > 0 && (
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white print:text-black">
              Unit Abilities
            </h4>
            <div className="text-sm text-gray-700 dark:text-gray-300 print:text-black space-y-2">
              {inlineAbilities.map((ability, index) => (
                <div key={ability.id || `inline-ability-${index}`}>
                  <span className="font-semibold">{ability.name}:</span>{' '}
                  <span dangerouslySetInnerHTML={{ __html: ability.description }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Referenced Abilities (Global abilities) */}
        {referencedAbilities.length > 0 && (
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white print:text-black">
              Core Abilities
            </h4>
            <div className="flex flex-wrap gap-1">
              {referencedAbilities.map((ability, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 print:bg-blue-100 print:text-black font-medium"
                  title={`See ${ability.name} in Global Abilities section below`}
                >
                  {ability.name}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600">
              See Global Abilities section for full descriptions
            </p>
          </div>
        )}

        {/* Unit Composition */}
        {unit.datasheet.unitComposition.length > 0 && (
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white print:text-black">
              Unit Composition
            </h4>
            <div className="text-sm text-gray-700 dark:text-gray-300 print:text-black">
              {unit.datasheet.unitComposition.map((comp, index) => (
                <div key={index}>{comp.description}</div>
              ))}
            </div>
          </div>
        )}

        {/* Loadout */}
        {unit.datasheet.loadout && (
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white print:text-black">
              Loadout
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 print:text-black">
              {unit.datasheet.loadout}
            </p>
          </div>
        )}

        {/* Damaged Profile */}
        {unit.datasheet.damagedW && unit.datasheet.damagedDescription && (
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white print:text-black">
              Damaged: {unit.datasheet.damagedW} Wounds Remaining
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 print:text-black">
              {unit.datasheet.damagedDescription}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ViewRosterUnitCard;
