import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

export interface MountOptions {
  /** BCP 47 language of the page, for `<html lang>`. */
  lang: string;
  /** Document title. */
  title: string;
}

/** Renders an app into `#root` and sets the document's language and title. */
export function mountApp(app: ReactNode, { lang, title }: MountOptions): void {
  document.documentElement.lang = lang;
  document.title = title;
  const root = document.getElementById('root');
  if (root === null) throw new Error('Missing #root element');
  createRoot(root).render(<StrictMode>{app}</StrictMode>);
}
