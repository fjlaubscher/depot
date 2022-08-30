import React, { useState } from 'react';
import classnames from 'classnames';

// components
import Container from '../container';

import styles from './tabs.module.scss';

interface Props {
  tabs: string[];
  onChange: (index: number) => void;
}

const Tabs: React.FC<Props> = ({ tabs, onChange }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <Container className={styles.container}>
      <div className={styles.tabs}>
        {tabs.map((t, i) => (
          <button
            key={`tab-${i}`}
            className={classnames(styles.tab, i === activeIndex && styles.active)}
            onClick={() => {
              setActiveIndex(i);
              onChange(i);
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </Container>
  );
};

export default Tabs;
