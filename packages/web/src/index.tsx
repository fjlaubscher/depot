import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { AppProvider } from './contexts/app-provider';
import { LayoutProvider } from './contexts/layout/context';
import { RosterProvider } from './contexts/roster/context';
import { ToastProvider } from './contexts/toast/context';
import { ErrorBoundary } from './components/shared';
import { ToastContainer } from './components/ui';
import Routes from './routes';
import { getRouterBasePath } from './utils/paths';

import './styles/main.css';
import './sentry';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter basename={getRouterBasePath()}>
      <AppProvider>
        <ToastProvider>
          <LayoutProvider>
            <RosterProvider>
              <ErrorBoundary
                fallbackTitle="Application Error"
                fallbackMessage="Something went wrong with the application. Please refresh the page or try again later."
                homeUrl="/"
                showRetry
              >
                <Routes />
              </ErrorBoundary>
              <ToastContainer />
            </RosterProvider>
          </LayoutProvider>
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
