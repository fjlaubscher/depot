import { useMemo } from 'react';
import { TagGroup, Tag, Grid, Card } from '@fjlaubscher/matter';

// components
import DatasheetProfileTable from '../../components/datasheet-profile/table';

// utils
import { sortByName } from '../../utils/array';
import { groupKeywords } from '../../utils/keywords';

import styles from './datasheet.module.scss';

interface Props {
  datasheet: depot.Datasheet;
  showCost?: boolean;
}

const DatasheetProfile = ({ datasheet, showCost }: Props) => {
  const { abilities, unitComposition, keywords, models, options: datasheetOptions } = datasheet;
  const sortedAbilities = useMemo(() => sortByName(abilities) as depot.Ability[], [abilities]);
  const groupedKeywords = useMemo(() => groupKeywords(keywords), [keywords]);

  const [options, notes] = useMemo(
    () =>
      datasheetOptions.reduce(
        (acc, o) => {
          const options = o.button ? [...acc[0], o] : acc[0];
          const notes = !o.button && o.description ? [...acc[1], o] : acc[1];

          return [options, notes];
        },
        [[] as depot.DatasheetOption[], [] as depot.DatasheetOption[]]
      ),
    [datasheetOptions]
  );

  return (
    <div className={styles.profile}>
      <DatasheetProfileTable profiles={models} showCost={showCost ?? true} />
      <p className={styles.composition}>{unitComposition}</p>
      <ul className={styles.options}>
        {options.map((o, i) => (
          <li key={`option-${i}`}>{o.description}</li>
        ))}
      </ul>
      <ul className={styles.notes}>
        {notes.map((n, i) => (
          <li key={`note-${i}`}>{n.description}</li>
        ))}
      </ul>
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
