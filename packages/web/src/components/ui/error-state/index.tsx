import type { FC, HTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Button from '../button';

interface ErrorStateProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  message?: string;
  stackTrace?: string;
  showRetry?: boolean;
  showHome?: boolean;
  onRetry?: () => void;
  homeUrl?: string;
  className?: string;
}

const ErrorState: FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error while loading this content. Please try again.',
  stackTrace,
  showRetry = true,
  showHome = true,
  onRetry = () => window.location.reload(),
  homeUrl = '/',
  className = '',
  ...props
}) => {
  return (
    <div
      data-testid="error-state"
      className={`flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] text-center px-4 py-6 gap-6 ${className}`}
      {...props}
    >
      <div className="flex flex-col gap-4 w-full max-w-lg">
        <AlertTriangle size={48} className="text-red-500 mx-auto sm:w-16 sm:h-16" />
        <div className="flex flex-col gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground px-2">{title}</h2>
          <p className="text-muted text-sm sm:text-base leading-relaxed px-2">{message}</p>
        </div>
        {stackTrace && (
          <details className="text-left w-full mt-2">
            <summary className="cursor-pointer text-sm text-subtle hover:text-foreground mb-2 text-center transition-colors">
              Show technical details
            </summary>
            <pre className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs text-danger overflow-auto max-h-32 sm:max-h-40 w-full">
              {stackTrace}
            </pre>
          </details>
        )}
      </div>

      <div className="flex flex-col w-full max-w-sm gap-3">
        {showRetry && (
          <Button onClick={onRetry} className="flex items-center justify-center gap-2 w-full">
            <RefreshCw size={16} />
            Try Again
          </Button>
        )}

        {showHome && (
          <Link to={homeUrl} className="w-full">
            <Button variant="secondary" className="flex items-center justify-center gap-2 w-full">
              <Home size={16} />
              Back to Home
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
