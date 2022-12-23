import React from 'react';
import { Button, ButtonProps } from '@fjlaubscher/matter';
import { useNavigate } from 'react-router-dom';

type Props = {
  to: string;
} & ButtonProps;

const LinkButton: React.FC<Props> = (props) => {
  const navigate = useNavigate();
  return <Button {...props} onClick={() => navigate(props.to)} />;
};

export default LinkButton;
