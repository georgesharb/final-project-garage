import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

// The demo build keeps the URL in memory so it works on any static host.
const Router = import.meta.env.VITE_DEMO === 'true' ? MemoryRouter : BrowserRouter;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>
);
