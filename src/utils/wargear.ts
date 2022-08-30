export const getWargearProfiles = (wargear: Wahapedia.Wargear[]) => {
  let profiles: Wahapedia.WargearProfile[] = [];
  let wargearIds: string[] = [];

  for (let i = 0; i < wargear.length; i++) {
    const ids = wargear[i].profiles.map((profile) => profile.wargear_id);
    profiles = [...profiles, ...wargear[i].profiles];
    wargearIds = [...wargearIds, ...ids];
  }

  const uniqueIds = new Set(wargearIds);

  // return profiles.filter((profile) => uniqueIds.has(profile.wargear_id));
  return profiles;
};
