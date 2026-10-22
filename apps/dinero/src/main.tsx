import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import './index.css';
import { m } from './paraglide/messages';
import { getLocale } from './paraglide/runtime';

document.documentElement.lang = getLocale();
document.title = m.title();

const root = document.getElementById('root');
if (root === null) throw new Error('Missing #root element');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
