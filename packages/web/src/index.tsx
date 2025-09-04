import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { AppProvider } from './contexts/app/context';
import { LayoutProvider } from './contexts/layout/context';
import { ToastProvider } from './contexts/toast/context';
import { ToastContainer } from './components/ui';
import Routes from './routes';

import './styles/main.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter basename={process.env.NODE_ENV === 'production' ? '/depot' : undefined}>
      <AppProvider>
        <LayoutProvider>
          <ToastProvider>
            <Routes />
            <ToastContainer />
          </ToastProvider>
        </LayoutProvider>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
