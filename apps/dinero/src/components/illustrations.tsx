import { chart, colors } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';

import { whimsy } from '../theme.stylex';

/** Small decorative drawings, one per chapter. All are hidden from assistive tech. */
export interface IllustrationProps {
  size?: number;
}

function Frame({ size = 64, children }: IllustrationProps & { children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden {...stylex.props(ink.svg)}>
      {children}
    </svg>
  );
}

function Coin({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} {...stylex.props(ink.coin)} />
      <circle cx={cx} cy={cy} r={r * 0.72} {...stylex.props(ink.coinInner)} />
    </g>
  );
}

/** Chapter 1: a stack of coins and one rolling away. */
export function CoinStack(props: IllustrationProps) {
  return (
    <Frame {...props}>
      {[50, 43, 36].map((y) => (
        <g key={y}>
          <ellipse cx={24} cy={y + 3} rx={16} ry={5} {...stylex.props(ink.coinEdge)} />
          <ellipse cx={24} cy={y} rx={16} ry={5} {...stylex.props(ink.coin)} />
        </g>
      ))}
      <Coin cx={48} cy={22} r={11} />
      <text x={48} y={26.5} textAnchor="middle" {...stylex.props(ink.coinLabel)}>
        €
      </text>
    </Frame>
  );
}

/** Chapter 2: an hourglass, sand running from 1979 to today. */
export function Hourglass(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <rect x={14} y={6} width={36} height={6} rx={3} {...stylex.props(ink.wood)} />
      <rect x={14} y={52} width={36} height={6} rx={3} {...stylex.props(ink.wood)} />
      <path
        d="M18 12 H46 C46 24 36 28 34 32 C36 36 46 40 46 52 H18 C18 40 28 36 30 32 C28 28 18 24 18 12 Z"
        {...stylex.props(ink.glass)}
      />
      <path d="M22 16 H42 C41 22 35 26 32 29 C29 26 23 22 22 16 Z" {...stylex.props(ink.coin)} />
      <path d="M21 50 C24 42 30 40 32 40 C34 40 40 42 43 50 Z" {...stylex.props(ink.coin)} />
      <line x1={32} y1={30} x2={32} y2={40} {...stylex.props(ink.sand)} />
    </Frame>
  );
}

/** Chapter 3: a parade of people, shortest to tallest. */
export function Parade(props: IllustrationProps) {
  const people = [14, 20, 26, 34, 48];
  return (
    <Frame {...props}>
      <line x1={4} y1={58} x2={60} y2={58} {...stylex.props(ink.ground)} />
      {people.map((height, index) => {
        const x = 8 + index * 12;
        return (
          <g key={height}>
            <rect
              x={x - 4}
              y={58 - height}
              width={8}
              height={height}
              rx={4}
              {...stylex.props(index === 2 ? ink.you : ink.person)}
            />
            <circle cx={x} cy={58 - height - 5} r={4} {...stylex.props(ink.head)} />
          </g>
        );
      })}
    </Frame>
  );
}

/** Chapter 4: a wavy trend line with a little flag on today. */
export function Trend(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <line x1={6} y1={56} x2={58} y2={56} {...stylex.props(ink.ground)} />
      <line x1={6} y1={8} x2={6} y2={56} {...stylex.props(ink.ground)} />
      <path d="M8 40 C16 30 22 46 30 34 S44 18 54 24" {...stylex.props(ink.line)} />
      <line x1={54} y1={24} x2={54} y2={8} {...stylex.props(ink.pole)} />
      <path d="M54 8 L64 12 L54 16 Z" {...stylex.props(ink.flag)} />
      <circle cx={54} cy={24} r={3.5} {...stylex.props(ink.you)} />
    </Frame>
  );
}

/** Chapter 5: a balance with a briefcase on one pan and coins on the other. */
export function Balance(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <line x1={32} y1={10} x2={32} y2={54} {...stylex.props(ink.pole)} />
      <rect x={20} y={54} width={24} height={5} rx={2.5} {...stylex.props(ink.wood)} />
      <line x1={10} y1={18} x2={54} y2={14} {...stylex.props(ink.pole)} />
      <path d="M4 34 Q12 40 20 34" {...stylex.props(ink.pan)} />
      <path d="M44 30 Q52 36 60 30" {...stylex.props(ink.pan)} />
      <line x1={10} y1={18} x2={6} y2={34} {...stylex.props(ink.string)} />
      <line x1={10} y1={18} x2={18} y2={34} {...stylex.props(ink.string)} />
      <line x1={54} y1={14} x2={46} y2={30} {...stylex.props(ink.string)} />
      <line x1={54} y1={14} x2={58} y2={30} {...stylex.props(ink.string)} />
      <rect x={6} y={25} width={12} height={9} rx={2} {...stylex.props(ink.case)} />
      <Coin cx={49} cy={26} r={4} />
      <Coin cx={55} cy={26} r={4} />
      <Coin cx={52} cy={20} r={4} />
      <circle cx={32} cy={10} r={3} {...stylex.props(ink.head)} />
    </Frame>
  );
}

/** Chapter 6: a ballot going into the box. */
export function BallotBox(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <rect
        x={22}
        y={6}
        width={20}
        height={24}
        rx={2}
        transform="rotate(-8 32 18)"
        {...stylex.props(ink.ballot)}
      />
      <line x1={26} y1={14} x2={37} y2={12} {...stylex.props(ink.string)} />
      <line x1={27} y1={19} x2={35} y2={18} {...stylex.props(ink.string)} />
      <rect x={8} y={28} width={48} height={30} rx={4} {...stylex.props(ink.box)} />
      <rect x={20} y={27} width={24} height={4} rx={2} {...stylex.props(ink.slot)} />
      <path d="M22 44 l6 6 l12 -12" {...stylex.props(ink.check)} />
    </Frame>
  );
}

const ink = stylex.create({
  svg: { flexShrink: 0, overflow: 'visible' },
  coin: { fill: whimsy.coin, stroke: whimsy.coinEdge, strokeWidth: 1.5 },
  coinInner: { fill: 'none', stroke: whimsy.coinEdge, strokeWidth: 1, opacity: 0.6 },
  coinEdge: { fill: whimsy.coinEdge },
  coinLabel: { fontSize: 13, fontWeight: 700, fill: whimsy.coinText },
  wood: { fill: whimsy.coinEdge },
  glass: { fill: colors.surface, stroke: colors.textMuted, strokeWidth: 2 },
  sand: { stroke: whimsy.coin, strokeWidth: 2, strokeDasharray: '2 2' },
  ground: { stroke: whimsy.path, strokeWidth: 2, strokeLinecap: 'round' },
  person: { fill: chart.series1 },
  you: { fill: whimsy.you },
  head: { fill: colors.textMuted },
  line: { fill: 'none', stroke: chart.series1, strokeWidth: 3.5, strokeLinecap: 'round' },
  pole: { stroke: colors.textMuted, strokeWidth: 2.5, strokeLinecap: 'round' },
  flag: { fill: whimsy.you },
  pan: { fill: 'none', stroke: colors.textMuted, strokeWidth: 2.5, strokeLinecap: 'round' },
  string: { stroke: colors.textMuted, strokeWidth: 1.2 },
  case: { fill: chart.series3 },
  ballot: { fill: colors.surface, stroke: colors.textMuted, strokeWidth: 1.5 },
  box: { fill: chart.series1 },
  slot: { fill: colors.text },
  check: {
    fill: 'none',
    stroke: colors.surface,
    strokeWidth: 4,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  },
});
