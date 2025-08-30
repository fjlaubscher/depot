import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { ToastProvider } from '@fjlaubscher/matter';

import { AppProvider } from './contexts/app/context';
import { LayoutProvider } from './contexts/layout/context';
import { ToastProvider as NewToastProvider } from './contexts/toast/context';
import { ToastContainer } from './components/ui';
import DataProvider from './components/data-provider';
import Routes from './routes';

import './styles/main.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <RecoilRoot>
        <AppProvider>
          <LayoutProvider>
            <NewToastProvider>
              <DataProvider>
                <ToastProvider>
                  <Routes />
                  <ToastContainer />
                </ToastProvider>
              </DataProvider>
            </NewToastProvider>
          </LayoutProvider>
        </AppProvider>
      </RecoilRoot>
    </BrowserRouter>
  </React.StrictMode>
);
