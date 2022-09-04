export const groupKeywords = (keywords: depot.Keyword[]) => {
  let datasheet: string[] = [];
  let faction: string[] = [];

  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i];
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
