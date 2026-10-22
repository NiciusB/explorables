# Home

The site's front page at `/`: what explorables are, and a card for each one.

- `src/explorables.ts` lists every explorable (newest first). Adding an explorable means adding an entry here, with its title and description as messages in `messages/{locale}.json`.
- It builds into the root of `dist/` without clearing it, so it never deletes the other apps' folders.
