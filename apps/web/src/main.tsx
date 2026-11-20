import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LifeOSProvider } from './context/LifeOSContext';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <LifeOSProvider>
          <App />
        </LifeOSProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);

