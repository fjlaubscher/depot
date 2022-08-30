import React from 'react';

import styles from './tags.module.scss';

interface Props {
  tags: string[];
}

const Tags: React.FC<Props> = ({ tags }) => (
  <div className={styles.tags}>
    {tags.map((tag, i) => (
      <span className={styles.tag} key={`tag-${i}`}>
        {tag}
      </span>
    ))}
  </div>
);

export default Tags;
