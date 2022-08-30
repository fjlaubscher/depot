import React from 'react';
import classNames from 'classnames';
import { FiGlobe } from 'react-icons/fi';

import styles from './wahapedia-link.module.scss'

interface Props {
  className?: string;
  href?: string;
}

const WahapediaLink: React.FC<Props> = ({ className, href }) => (
  <a className={classNames(styles.link, className)} href={href || `https://wahapedia.ru`} target="_blank" rel='noopener'>
    <FiGlobe />
  </a>
);

export default WahapediaLink;
