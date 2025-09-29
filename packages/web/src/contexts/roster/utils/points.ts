import type { depot } from '@depot/core';

export const calculateTotalPoints = (roster: depot.Roster): number => {
  let total = 0;

  roster.units.forEach((unit) => {
    total += parseInt(unit.modelCost.cost, 10) || 0;
  });

  roster.enhancements.forEach(({ enhancement }) => {
    total += parseInt(enhancement.cost, 10) || 0;
  });

  return total;
};
