# AGENTS.md

This repo is a monorepo of **explorable explanations**: small, self-contained websites that teach one idea by letting the reader play with it.

## What is an explorable?

An explorable explanation is an interactive piece of writing where the reader learns by doing, not just by reading. The term comes from Bret Victor's 2011 essay [Explorable Explanations](https://worrydream.com/ExplorableExplanations/). See [explorabl.es](https://explorabl.es/) for a curated collection.

A good explorable:

- **Teaches one idea well.** Narrow scope, clear takeaway.
- **Makes the reader an active participant.** An explorable is like a toy that teaches you. Sliders, draggable numbers, tooltips and hover effects, simulations, and small puzzles let them form and test hypotheses.
- **Interleaves prose and interaction.** Text sets up a question, the interactive answers it, the text reflects on what the reader saw. Animations are better than 1000 words.
- **Builds up gradually.** Start with a simple, concrete case, then add complexity one step at a time.
- **Gives immediate feedback.** Every change the reader makes is reflected instantly.
- **Works without instructions.** Controls are discoverable; defaults show something interesting before any interaction.
- **Fully works on mobile**: Most people use the web on mobile phones nowadays. It should be 100% responsive and consider mobile on its designs and interactions.

### Examples

- [Parable of the Polygons](https://ncase.me/polygons/) (Vi Hart & Nicky Case): how small individual biases produce large-scale segregation.
- [The Evolution of Trust](https://ncase.me/trust/) (Nicky Case): game theory and the iterated prisoner's dilemma.
- [Up and Down the Ladder of Abstraction](https://worrydream.com/LadderOfAbstraction/) (Bret Victor): understanding systems by moving between concrete and abstract views.
- [Hexagonal Grids](https://www.redblobgames.com/grids/hexagons/) (Red Blob Games): coordinate systems and algorithms for hex grids.
- [Mechanical Watch](https://ciechanow.ski/mechanical-watch/) (Bartosz Ciechanowski): how a watch works, through manipulable 3D models.
- [Seeing Theory](https://seeing-theory.brown.edu/) (Brown University): probability and statistics, visually.

## Repo layout

Each explorable is its own app under `apps/<explorable-name>/`, with its own `AGENTS.md` for topic-specific decisions. Shared code lives under `packages/`.

- `apps/home/`: the front page at `/`, listing every explorable.
- `apps/dinero/`: money and inequality in Spain, at `/dinero/`.
- `packages/ui/` (`@explorables/ui`): shared components built on Base UI and styled with StyleX, including the `Page` shell (reading column, home link, language control) and `mountApp()`. Theme and chart tokens live in `@explorables/ui/tokens.stylex`.
- `packages/vite-config/` (`@explorables/vite-config`): `defineExplorableConfig({ path })` gives every app the same plugins (Paraglide, StyleX, React), test setup, and output folder. An app's whole `vite.config.ts` is one call to it.
- Root `vite.config.ts` holds the lint (Oxlint, strict, type-aware) and format config for the whole repo; `.fallowrc.json` holds Fallow's. Per-package `vite.config.ts` files only set plugins and test options.

## Deployment

The site is one static folder served by nginx at explorables.balbona.me. `vp run build:site` clears `dist/` and builds every app into it: `home` at the root, each explorable in `dist/<path>/` with `base: '/<path>/'`. Apps are separate Vite builds so each keeps its own dependencies and bundle. Locale choice is shared across apps through Paraglide's `localStorage` key (same origin).

CD: on push to `main`, after `check` passes, CI's `deploy` job SSHes into the server with the `DEPLOY_SSH_KEY` secret, whose `authorized_keys` entry forces `scripts/deploy.sh` (pull, `npm ci`, `build:site`, rsync into `/var/www/explorables`). The nginx config lives on the server at `/etc/nginx/conf.d/explorables.conf`.

To add an explorable: create `apps/<path>/` with `defineExplorableConfig({ path: '<path>' })`, then list it in `apps/home/src/explorables.ts`.

## Stack

- Package manager: npm
- Language: TypeScript
- Frontend: React, Vite, StyleX, Paraglide, Base UI (unstyled components, wrapped in `packages/ui`)
- Tests: Vitest via `vp test` (jsdom + Testing Library), colocated as `*.test.ts(x)`
- Monorepo / test / formatting / linting / git hooks: Vite+ (`vp`)
- Code quality: Fallow
- Pre-commit hook and CI (GitHub Actions): `vp run check`
- Paraglide: never run it manually; the Vite plugin compiles messages during `vp dev`, `vp build`, and `vp test`. Output (`src/paraglide/`) is gitignored, which is why `vp run check` builds the site first.
- Dev server: `vp -C apps/<explorable-name> dev` (an explorable is served under its path, e.g. `/dinero/`).

## Rules

- **Mandatory checks:** run `vp run check` from the git root after any code change. It runs typecheck, tests, linting, formatting, and Fallow, the same way the pre-commit hook and CI do.
- **Testing:** add tests for everything you add or change. Skip only tests that assert trivia or mock so heavily that they test very little.
- **Strictness:** lint, typecheck, and Fallow are deliberately strict. Fix findings instead of suppressing them; if a rule is genuinely wrong for this repo, turn it off in the root config with a comment explaining why.
- **Changes:** commit as you go. Match existing style and avoid unrelated refactors. If a change makes something in this file wrong, update this file, keeping it concise.
- **Sources:** every explorable cites where its data comes from. Keep a typed registry in `apps/<explorable-name>/src/sources.ts` (title, publisher, URL, date accessed), point each dataset at an entry with a `Citation` (source id plus article, table, or page), and list all sources on the page for readers. Prefer primary sources (BOE, official gazettes, statistics agencies) over secondary summaries, and note in code comments where a source is ambiguous or has errata.
- **Translatable UI copy:** treat every user-facing string as i18n. Add a key to `apps/<explorable-name>/messages/{locale}.json` for each locale (`en`, `es`) and use `m.<key>()`. Don't ship hardcoded user-facing natural-language strings. Shared packages return codes (e.g. `ErrorCode`), never display text.
- **Chrome DevTools MCP:** use it to run and debug an explorable the way a reader would.
