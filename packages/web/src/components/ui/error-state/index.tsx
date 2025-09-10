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
      className={`flex flex-col items-center justify-center min-h-[400px] text-center px-4 gap-4 ${className}`}
      {...props}
    >
      <div className="flex flex-col gap-4">
        <AlertTriangle size={64} className="text-red-500 mx-auto" />
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">{message}</p>
        </div>
        {stackTrace && (
          <details className="text-left max-w-2xl flex flex-col gap-2">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              Show technical details
            </summary>
            <pre className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs text-red-600 dark:text-red-400 overflow-auto max-h-40">
              {stackTrace}
            </pre>
          </details>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {showRetry && (
          <Button onClick={onRetry} className="flex items-center gap-2">
            <RefreshCw size={16} />
            Try Again
          </Button>
        )}

        {showHome && (
          <Link to={homeUrl}>
            <Button variant="secondary" className="flex items-center gap-2">
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
