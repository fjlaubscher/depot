import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import DataProvider from './components/data-provider';
import Routes from './routes';

import './styles/global.scss';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <DataProvider>
        <Routes />
      </DataProvider>
    </BrowserRouter>
  </React.StrictMode>
);
