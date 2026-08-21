import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

// UI Components
import AppLayout from '@/components/layout';
import Button from '@/components/ui/button';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppLayout title="Page Not Found">
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-sm text-center">
          <div className="font-mono text-[32px] leading-none font-bold text-hint">404</div>
          <Search size={28} className="mx-auto mt-3 text-hint" data-testid="not-found-icon" />
          <h1
            className="mt-2.5 text-base leading-snug font-bold text-foreground"
            data-testid="page-heading"
          >
            Page Not Found
          </h1>
          <p className="mt-1 text-[12.5px] leading-normal text-muted">
            The page you're looking for has been moved, deleted, or doesn't exist.
          </p>
          <div className="mt-3.5 flex justify-center gap-1">
            <Button variant="secondary" onClick={() => navigate('/')} data-testid="go-home-button">
              Return home
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.history.back()}
              data-testid="go-back-button"
            >
              Go back
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default NotFound;
