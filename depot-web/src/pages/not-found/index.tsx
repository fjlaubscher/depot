import { useNavigate } from 'react-router-dom';
import { FaHome, FaSearch } from 'react-icons/fa';

// UI Components
import Layout from '@/components/ui/layout';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Layout title="Not Found">
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="max-w-md text-center">
          <div className="space-y-6">
            {/* Large 404 Display */}
            <div className="space-y-2">
              <div className="text-6xl font-bold text-gray-300 dark:text-gray-600">404</div>
              <FaSearch
                className="mx-auto text-4xl text-gray-400 dark:text-gray-500"
                data-testid="not-found-icon"
              />
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Page Not Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                The page you're looking for has been moved, deleted, or doesn't exist.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button onClick={handleGoHome} className="w-full" data-testid="go-home-button">
                <FaHome className="mr-2" />
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
    </Layout>
  );
};

export default NotFound;
