import { useMemo } from 'react';
import { TagGroup, Tag, Grid, Card } from '@fjlaubscher/matter';
import { depot } from 'depot-core';

// components
import DatasheetProfileTable from '../../components/datasheet-profile/table';
import WargearProfileTable from '../../components/wargear-profile/table';

// utils
import { sortByName } from '../../utils/array';
import { groupKeywords } from '../../utils/keywords';

import styles from './datasheet.module.scss';

interface Props {
  datasheet: depot.Datasheet;
}

const DatasheetProfile = ({ datasheet }: Props) => {
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

  const [meleeWargear, rangedWargear] = useMemo(() => {
    const melee = wargear.filter((w) => w.type === 'Melee');
    const ranged = wargear.filter((w) => w.type === 'Ranged');
    return [melee, ranged];
  }, [wargear]);

  return (
    <div className={styles.profile}>
      <DatasheetProfileTable profiles={models} />
      <div className={styles.tagSection}>
        <h4>Wargear</h4>
        <WargearProfileTable type="Ranged" profiles={rangedWargear} />
        <WargearProfileTable type="Melee" profiles={meleeWargear} />
      </div>
      <div className={styles.tagSection}>
        <h4>Unit Composition</h4>
        <ul className={styles.composition}>
          {unitComposition.map((comp, i) => (
            <li key={`composition-${comp.line}`}>
              {comp.description} {models[i] ? `(${models[i].baseSize})` : null}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.tagSection}>
        <h4>Unit Options</h4>
        <ul className={styles.options}>
          {options.map((o, i) => (
            <li key={`unit-option-${o.line}`} dangerouslySetInnerHTML={{ __html: o.description }} />
          ))}
        </ul>
      </div>
      <div className={styles.tagSection}>
        <h4>Abilities</h4>
        <Grid>
          {sortedAbilities.map((ability) => (
            <Card key={ability.id} title={ability.name}>
              <p dangerouslySetInnerHTML={{ __html: ability.description }} />
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
