import { colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

import { CHAPTERS } from '../chapters';
import { m } from '../paraglide/messages';
import { whimsy } from '../theme.stylex';
import { NumberCoin } from './NumberCoin';

const WIDE = '@media (min-width: 640px)';

/** The cover's menu: every chapter as a stop on a winding path, like a board game. */
export function ChapterMap() {
  return (
    <nav aria-label={m.map_label()}>
      <ol {...stylex.props(styles.list)}>
        {CHAPTERS.map((chapter, index) => {
          const { Illustration } = chapter;
          const right = index % 2 === 1;
          return (
            <li key={chapter.id} {...stylex.props(styles.stop, right && styles.right)}>
              {index > 0 ? <Connector flip={right} /> : null}
              <a href={`#${chapter.id}`} {...stylex.props(styles.card)}>
                <NumberCoin number={index + 1} size={36} />
                <span {...stylex.props(styles.text)}>
                  <span {...stylex.props(styles.title)}>{chapter.title()}</span>
                  <span {...stylex.props(styles.teaser)}>{chapter.teaser()}</span>
                </span>
                <span {...stylex.props(styles.art)}>
                  <Illustration size={52} />
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** A dashed curve from the previous stop to this one; mirrored on alternate stops. */
function Connector({ flip }: { flip: boolean }) {
  return (
    <svg
      viewBox="0 0 100 32"
      preserveAspectRatio="none"
      aria-hidden
      {...stylex.props(styles.connector, flip && styles.flipped)}
    >
      <path d="M12 0 C12 20 88 12 88 32" {...stylex.props(styles.path)} />
    </svg>
  );
}

const styles = stylex.create({
  list: {
    display: 'flex',
    flexDirection: 'column',
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  stop: {
    display: 'flex',
    flexDirection: 'column',
    width: { default: '100%', [WIDE]: '78%' },
  },
  right: {
    alignSelf: { default: 'auto', [WIDE]: 'flex-end' },
  },
  connector: {
    display: { default: 'none', [WIDE]: 'block' },
    width: '100%',
    height: 32,
    overflow: 'visible',
  },
  flipped: {
    transform: 'scaleX(-1)',
  },
  path: {
    fill: 'none',
    stroke: whimsy.path,
    strokeWidth: 3,
    strokeDasharray: '2 7',
    strokeLinecap: 'round',
    vectorEffect: 'non-scaling-stroke',
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: space.md,
    marginBlock: { default: space.xs, [WIDE]: 0 },
    padding: space.md,
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: { default: whimsy.path, ':hover': whimsy.coinEdge },
    color: colors.text,
    textDecoration: 'none',
    backgroundColor: whimsy.paper,
    transition: 'transform 180ms cubic-bezier(.34,1.56,.64,1), border-color 150ms',
    transform: { default: 'none', ':hover': 'translateY(-3px) rotate(-0.6deg)' },
  },
  text: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    gap: 2,
  },
  title: {
    fontFamily: whimsy.display,
    fontSize: 21,
    fontWeight: 650,
    lineHeight: 1.15,
  },
  teaser: {
    fontSize: 15,
    lineHeight: 1.4,
    color: colors.textMuted,
  },
  art: {
    display: { default: 'none', '@media (min-width: 420px)': 'block' },
  },
});
