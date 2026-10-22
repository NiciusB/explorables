import { useChartTooltip } from './useChartTooltip';

export interface CursorOptions {
  xs: readonly number[];
  labels: readonly string[];
  label: string;
  rest: number;
  width: number;
  left: number;
  right: number;
}

/** A single tab stop lets readers inspect every sample with the arrow keys. */
export function useChartCursor({ xs, labels, label, rest, width, left, right }: CursorOptions) {
  const tip = useChartTooltip(labels);
  const nearest = (value: number) =>
    xs.reduce(
      (best, x, index) => (Math.abs(x - value) < Math.abs((xs[best] ?? 0) - value) ? index : best),
      0,
    );
  const index = tip.active ?? nearest(rest);
  const first = xs[0] ?? 0;
  const last = xs.at(-1) ?? first;
  const move = (event: React.PointerEvent) => {
    if (xs.length === 0) return;
    const box = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - box.left) * (box.width > 0 ? width / box.width : 1);
    const ratio = Math.min(1, Math.max(0, (px - left) / Math.max(1, width - left - right)));
    tip.show(nearest(first + ratio * (last - first)), event.currentTarget, event);
  };
  return {
    value: xs[index] ?? rest,
    tooltip: tip.tooltip,
    props: {
      ...tip.target(index),
      role: 'slider' as const,
      'aria-label': label,
      'aria-valuemin': first,
      'aria-valuemax': last,
      'aria-valuenow': xs[index] ?? rest,
      'aria-valuetext': labels[index],
      onPointerEnter: move,
      onPointerMove: move,
      onPointerDown: move,
      onKeyDown: (event: React.KeyboardEvent) => {
        if (event.key === 'Escape') {
          tip.dismiss();
          return;
        }
        const offsets: Record<string, number> = {
          ArrowLeft: -1,
          ArrowDown: -1,
          ArrowRight: 1,
          ArrowUp: 1,
        };
        const offset = offsets[event.key];
        const next =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? xs.length - 1
              : offset === undefined
                ? undefined
                : index + offset;
        if (next === undefined || xs.length === 0) return;
        event.preventDefault();
        tip.show(Math.max(0, Math.min(xs.length - 1, next)), event.currentTarget);
      },
    },
  };
}
