import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { ToastProvider } from '@fjlaubscher/matter';

import DataProvider from './components/data-provider';
import Routes from './routes';

import './styles/global.scss';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <RecoilRoot>
        <DataProvider>
          <ToastProvider>
            <Routes />
          </ToastProvider>
        </DataProvider>
      </RecoilRoot>
    </BrowserRouter>
  </React.StrictMode>
);
