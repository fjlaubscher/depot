import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { AppProvider } from './contexts/app/context';
import { LayoutProvider } from './contexts/layout/context';
import { ToastProvider } from './contexts/toast/context';
import { ToastContainer } from './components/ui';
import DataProvider from './components/data-provider';
import Routes from './routes';

import './styles/main.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <LayoutProvider>
          <ToastProvider>
            <DataProvider>
              <Routes />
              <ToastContainer />
            </DataProvider>
          </ToastProvider>
        </LayoutProvider>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
