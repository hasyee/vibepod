import { Classes } from '@blueprintjs/core';
import '@blueprintjs/core/lib/css/blueprint.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

document.body.classList.add(Classes.DARK);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
