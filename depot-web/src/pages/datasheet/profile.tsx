import { useMemo } from 'react';
import { TagGroup, Tag, Grid, Card } from '@fjlaubscher/matter';

// components
import DatasheetProfileTable from '../../components/datasheet-profile/table';
import WargearProfileTable from '../../components/wargear-profile/table';

// utils
import { sortByName } from '../../utils/array';
import { groupKeywords } from '../../utils/keywords';

import styles from './datasheet.module.scss';

interface Props {
  datasheet: depot.Datasheet;
  showCost?: boolean;
}

const DatasheetProfile = ({ datasheet, showCost }: Props) => {
  const {
    abilities,
    unitComposition,
    keywords,
    models,
    options: datasheetOptions,
    wargear
  } = datasheet;
  const sortedAbilities = useMemo(() => sortByName(abilities) as depot.Ability[], [abilities]);
  const groupedKeywords = useMemo(() => groupKeywords(keywords), [keywords]);

  const options = useMemo(() => datasheetOptions.filter((o) => o.description), [datasheetOptions]);

  const wargearProfiles = useMemo(() => {
    return wargear.reduce((acc, w) => {
      const profiles =
        w.profiles.length > 1
          ? w.profiles.map((p) => ({ ...p, name: `${w.name} - ${p.name}` } as depot.WargearProfile))
          : w.profiles;

      return [...acc, ...profiles];
    }, [] as depot.WargearProfile[]);
  }, [wargear]);

  return (
    <div className={styles.profile}>
      <DatasheetProfileTable profiles={models} showCost={showCost ?? true} />
      <p className={styles.composition}>{unitComposition}</p>
      <ul className={styles.options}>
        {options.map((o, i) =>
          o.description === '&nbsp;' ? (
            <br />
          ) : (
            <li key={`option-${i}`} className={o.button === '-' ? styles.subItem : styles.item}>
              {o.button === '-' ? `- ${o.description}` : o.description}
            </li>
          )
        )}
      </ul>
      <div className={styles.tagSection}>
        <h4>Wargear</h4>
        <WargearProfileTable profiles={wargearProfiles} />
      </div>
      <div className={styles.tagSection}>
        <h4>Abilities</h4>
        <Grid>
          {sortedAbilities.map((ability) => (
            <Card key={ability.id} title={ability.name}>
              <p>{ability.description}</p>
            </Card>
          ))}
        </Grid>
      </div>
      <div className={styles.tagSection}>
        <h4>Keywords</h4>
        <TagGroup>
          {groupedKeywords.datasheet.map((k, i) => (
            <Tag key={`keyword-${i}`}>{k}</Tag>
          ))}
        </TagGroup>
      </div>
      <div className={styles.tagSection}>
        <h4>Faction Keywords</h4>
        <TagGroup>
          {groupedKeywords.faction.map((k, i) => (
            <Tag key={`faction-keyword-${i}`}>{k}</Tag>
          ))}
        </TagGroup>
      </div>
    </div>
  );
};

export default DatasheetProfile;
