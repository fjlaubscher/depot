import React from 'react';
import { Link } from 'react-router-dom';
import { FaClipboardList } from 'react-icons/fa';
import { Layout, Button } from '../ui';
import { useToast } from '@/contexts/toast/use-toast-context';

interface Props {
  children: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  isLoading?: boolean;
}

const AppLayout = ({ children, title, action, isLoading }: Props) => {
  const { showToast } = useToast();

  // Test sidebar content
  const sidebar = (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Navigation</h3>
      <div className="space-y-2">
        <Link 
          to="/" 
          className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          Home
        </Link>
        <Link 
          to="/settings" 
          className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          Settings
        </Link>
      </div>
      
      <hr className="my-4 border-gray-200 dark:border-gray-600" />
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Test Toast System</h4>
        <Button 
          size="sm" 
          onClick={() => showToast({ title: 'Success!', message: 'This is a success toast', type: 'success' })}
        >
          Test Success
        </Button>
        <Button 
          size="sm" 
          variant="error"
          onClick={() => showToast({ title: 'Error!', message: 'This is an error toast', type: 'error' })}
        >
          Test Error
        </Button>
        <Button 
          size="sm" 
          onClick={() => showToast({ title: 'Info', message: 'This is an info toast', type: 'info' })}
        >
          Test Info
        </Button>
        <Button 
          size="sm" 
          onClick={() => showToast({ title: 'Warning', message: 'This is a warning toast', type: 'warning' })}
        >
          Test Warning
        </Button>
      </div>
    </div>
  );

  return (
    <Layout
      action={action}
      title={title}
      home={
        <Link to="/">
          <FaClipboardList />
        </Link>
      }
      isLoading={isLoading}
      sidebar={sidebar}
    >
      {children}
    </Layout>
  );
};

export default AppLayout;
