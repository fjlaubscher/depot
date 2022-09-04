import React from 'react';
import classnames from 'classnames';

import styles from './form.module.scss';

interface Props {
  children: React.ReactNode;
  className?: string;
  id?: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const Form: React.FC<Props> = ({ children, className, id, onSubmit }) => (
  <form id={id} className={classnames(styles.form, className)} onSubmit={onSubmit}>
    {children}
  </form>
);

export default Form;
