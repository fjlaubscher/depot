import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  to: string;
  label: string;
  ariaLabel?: string;
  testId?: string;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({
  to,
  label,
  ariaLabel,
  testId = 'mobile-back-button',
  className = ''
}) => {
  return (
    <div className={className}>
      <Link
        to={to}
        className="inline-flex items-center gap-2 text-subtle hover:text-foreground border border-subtle rounded-md px-2 py-1 transition-colors text-sm"
        aria-label={ariaLabel || `Back to ${label}`}
        data-testid={testId}
      >
        <ArrowLeft size={16} />
        <span className="font-medium">{label}</span>
      </Link>
    </div>
  );
};

export default BackButton;
