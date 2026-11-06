import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

// Optional visual theme (e.g. VITE_THEME=warm) — applied before first paint of the client.
const theme = (import.meta.env.VITE_THEME ?? '').trim();
if (theme) document.documentElement.dataset.theme = theme;

const root = document.getElementById('root')!;

if (import.meta.env.VITE_ROUTER === 'hash') {
  // Preview-only mode for sandboxed hosts that cannot serve real URL paths
  // (e.g. a claude.ai artifact). Never used for production.
  createRoot(root).render(
    <StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </StrictMode>,
  );
} else {
  hydrateRoot(
    root,
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
}
