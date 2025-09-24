import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { AppProvider } from './contexts/app/context';
import { LayoutProvider } from './contexts/layout/context';
import { RosterProvider } from './contexts/roster/context';
import { ToastProvider } from './contexts/toast/context';
import { ErrorBoundary } from './components/shared';
import { ToastContainer } from './components/ui';
import Routes from './routes';

import './styles/main.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter basename={process.env.NODE_ENV === 'production' ? '/depot' : undefined}>
      <AppProvider>
        <LayoutProvider>
          <RosterProvider>
            <ToastProvider>
              <ErrorBoundary
                fallbackTitle="Application Error"
                fallbackMessage="Something went wrong with the application. Please refresh the page or try again later."
                homeUrl="/"
                showRetry
              >
                <Routes />
              </ErrorBoundary>
              <ToastContainer />
            </ToastProvider>
          </RosterProvider>
        </LayoutProvider>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
