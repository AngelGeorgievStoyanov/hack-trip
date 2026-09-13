import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { HelmetProvider } from 'react-helmet-async';
import { LoginProvider } from './hooks/LoginContext';
import { ConfirmDialogProvider } from './components/ConfirmDialog/ConfirmDialog';



const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
const helmetContext = {};

root.render(
  <HelmetProvider context={helmetContext}>
    <React.StrictMode>
      <ConfirmDialogProvider>
        <LoginProvider>
          <App />
        </LoginProvider>
      </ConfirmDialogProvider>
    </React.StrictMode>
  </HelmetProvider >
);




