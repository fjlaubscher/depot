import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { AppProvider } from './contexts/app-provider';
import { RosterProvider } from './contexts/roster/context';
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
        <RosterProvider>
          <ErrorBoundary>
            <Routes />
          </ErrorBoundary>
          <ToastContainer />
        </RosterProvider>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
