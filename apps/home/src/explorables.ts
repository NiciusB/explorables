import { m } from './paraglide/messages';

export interface Explorable {
  /** Path under the site root; also the app's folder name in `apps/`. */
  path: string;
  title: () => string;
  description: () => string;
  inProgress: boolean;
}

/** Every explorable on the site, newest first. */
export const EXPLORABLES: readonly Explorable[] = [
  {
    path: 'dinero',
    title: m.dinero_title,
    description: m.dinero_description,
    inProgress: true,
  },
];
