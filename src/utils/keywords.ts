export const groupKeywords = (keywords: Wahapedia.Keyword[]) => {
  let datasheet: string[] = [];
  let faction: string[] = [];

  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i];
    if (keyword.is_faction_keyword === 'true') {
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
