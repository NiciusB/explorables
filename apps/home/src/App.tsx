import { Page } from '@explorables/ui';
import { chart, colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

import { EXPLORABLES, type Explorable } from './explorables';
import { m } from './paraglide/messages';
import { getLocale, locales, setLocale } from './paraglide/runtime';

export function App() {
  return (
    <Page
      languageLabel={m.language()}
      locales={locales}
      locale={getLocale()}
      onLocaleChange={(next) => void setLocale(next)}
    >
      <header {...stylex.props(styles.header)}>
        <h1 {...stylex.props(styles.title)}>{m.site_title()}</h1>
        <p {...stylex.props(styles.lede)}>{m.site_lede()}</p>
        <p>{m.site_intro()}</p>
      </header>
      <section {...stylex.props(styles.section)}>
        <h2 {...stylex.props(styles.sectionTitle)}>{m.explorables_title()}</h2>
        <ul {...stylex.props(styles.list)}>
          {EXPLORABLES.map((explorable) => (
            <li key={explorable.path}>
              <ExplorableCard explorable={explorable} />
            </li>
          ))}
        </ul>
      </section>
      <footer {...stylex.props(styles.footer)}>{m.inspiration()}</footer>
    </Page>
  );
}

function ExplorableCard({ explorable }: { explorable: Explorable }) {
  return (
    <a href={`/${explorable.path}/`} {...stylex.props(styles.card)}>
      <StaircaseMotif />
      <div {...stylex.props(styles.cardBody)}>
        {explorable.inProgress ? (
          <span {...stylex.props(styles.badge)}>{m.status_in_progress()}</span>
        ) : null}
        <h3 {...stylex.props(styles.cardTitle)}>{explorable.title()}</h3>
        <p {...stylex.props(styles.cardDescription)}>{explorable.description()}</p>
        <span aria-hidden {...stylex.props(styles.cardAction)}>
          {m.open_explorable()} →
        </span>
      </div>
    </a>
  );
}

/** Rates for the decorative staircase: each step keeps less of the euro. */
const MOTIF_RATES = [0, 0, 0.19, 0.24, 0.3, 0.37, 0.45];
const MOTIF_STEPS = MOTIF_RATES.map((rate, position) => ({ position, rate }));
const MOTIF_SOCIAL = 0.065;
const motifY = (fraction: number) => 40 * (1 - fraction);

/** Decorative echo of the dinero staircase chart. */
function StaircaseMotif() {
  const width = 100 / MOTIF_STEPS.length;
  return (
    <svg
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      aria-hidden
      {...stylex.props(styles.motif)}
    >
      {MOTIF_STEPS.map(({ position, rate }) => {
        const x = position * width + 0.5;
        return (
          <g key={position}>
            <rect
              x={x}
              width={width - 1}
              y={0}
              height={motifY(rate + MOTIF_SOCIAL)}
              {...stylex.props(styles.net)}
            />
            <rect
              x={x}
              width={width - 1}
              y={motifY(rate + MOTIF_SOCIAL)}
              height={40 * rate}
              {...stylex.props(styles.irpf)}
            />
            <rect
              x={x}
              width={width - 1}
              y={motifY(MOTIF_SOCIAL)}
              height={40 * MOTIF_SOCIAL}
              {...stylex.props(styles.social)}
            />
          </g>
        );
      })}
    </svg>
  );
}

const styles = stylex.create({
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.md,
  },
  title: {
    fontSize: 'clamp(2.5rem, 8vw, 4rem)',
    lineHeight: 1,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  lede: {
    fontSize: 22,
    lineHeight: 1.4,
    color: colors.textMuted,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: colors.textMuted,
    margin: 0,
  },
  list: {
    display: 'grid',
    gap: space.md,
    padding: 0,
    listStyle: 'none',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: 16,
    color: 'inherit',
    textDecoration: 'none',
    backgroundColor: colors.surface,
    transition: 'transform 150ms ease-out, box-shadow 150ms ease-out',
    boxShadow: {
      default: 'none',
      ':hover': '0 8px 24px rgb(0 0 0 / 0.08)',
    },
    transform: {
      default: 'none',
      ':hover': 'translateY(-2px)',
    },
  },
  motif: {
    display: 'block',
    width: '100%',
    height: 96,
  },
  net: { fill: chart.series1, fillOpacity: 0.18 },
  irpf: { fill: chart.series2 },
  social: { fill: chart.series3 },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: space.sm,
    padding: space.lg,
  },
  badge: {
    paddingBlock: 2,
    paddingInline: space.sm,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    color: colors.accent,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.accent,
  },
  cardTitle: {
    fontSize: 24,
    lineHeight: 1.2,
    margin: 0,
  },
  cardDescription: {
    color: colors.textMuted,
  },
  cardAction: {
    fontWeight: 600,
    color: colors.accent,
  },
  footer: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
