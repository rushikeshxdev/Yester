import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from './context/ThemeContext';
import { LifeOSProvider } from './context/LifeOSContext';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <LifeOSProvider>
        <App />
      </LifeOSProvider>
    </ThemeProvider>
  </React.StrictMode>
);

