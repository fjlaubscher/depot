import type { Keyword } from '../../types/depot.js';

export interface GroupedKeywords {
  datasheet: string[];
  faction: string[];
}

export const groupKeywords = (keywords: Keyword[]): GroupedKeywords => {
  const datasheet: string[] = [];
  const faction: string[] = [];

  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i];
    if (!keyword.keyword) {
      continue;
    }

    if (keyword.isFactionKeyword === 'true') {
      faction.push(keyword.keyword);
    } else {
      datasheet.push(keyword.keyword);
    }
  }

  return {
    datasheet: datasheet.sort(),
    faction: faction.sort()
  };
};
