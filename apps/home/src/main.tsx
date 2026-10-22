import { mountApp } from '@explorables/ui';

import { App } from './App';
import './index.css';
import { m } from './paraglide/messages';
import { getLocale } from './paraglide/runtime';

mountApp(<App />, { lang: getLocale(), title: m.site_title() });
