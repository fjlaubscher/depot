import React, { useMemo } from 'react';
import Card from '../../components/card';

// components
import DatasheetProfileTable from '../../components/datasheet-profile/table';
import Tags from '../../components/tags';

// utils
import { groupKeywords } from '../../utils/keywords';
import slugify from '../../utils/slugify';

import styles from './datasheet.module.scss';

interface Props {
  composition: string;
  keywords: Wahapedia.Keyword[];
  power: string;
  profiles: Wahapedia.DatasheetProfile[];
  role: string;
}

const DatasheetProfile: React.FC<Props> = ({ composition, keywords, power, profiles, role }) => {
  const groupedKeywords = useMemo(() => groupKeywords(keywords), [keywords]);
  return (
    <>
      <Card className={styles.card}>
        <div className={styles.header}>
          <div className={styles.role}>
            <img src={`/role/${slugify(role)}.png`} alt={role} />
            <span>{role}</span>
          </div>
          <span className={styles.power}>{power} PR</span>
        </div>
        <DatasheetProfileTable profiles={profiles} />
        <p className={styles.composition}>{composition}</p>
      </Card>
      <div className={styles.tagSection}>
        <h4>Keywords</h4>
        <Tags tags={groupedKeywords.datasheet} />
      </div>
      <div className={styles.tagSection}>
        <h4>Faction Keywords</h4>
        <Tags tags={groupedKeywords.faction} />
      </div>
    </>
  );
};

export default DatasheetProfile;
