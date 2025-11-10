import { useNavigate } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

// UI Components
import AppLayout from '@/components/layout';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <AppLayout title="Not Found">
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="max-w-md text-center">
          <div className="space-y-6">
            {/* Large 404 Display */}
            <div className="space-y-2">
              <div className="text-6xl font-bold text-gray-300 dark:text-gray-600">404</div>
              <Search size={64} className="mx-auto text-hint" data-testid="not-found-icon" />
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground" data-testid="page-heading">
                Page Not Found
              </h2>
              <p className="text-muted">
                The page you're looking for has been moved, deleted, or doesn't exist.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button onClick={handleGoHome} className="w-full" data-testid="go-home-button">
                <Home size={16} className="mr-2" />
                Return to Home
              </Button>

              <Button
                variant="secondary"
                onClick={() => window.history.back()}
                className="w-full"
                data-testid="go-back-button"
              >
                Go Back
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default NotFound;
