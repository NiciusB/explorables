import { colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface ActivePoint {
  element: Element;
  index: number;
  x: number;
  y: number;
}

/** Shared readout for chart marks: pointer, tap and keyboard focus use the same data. */
export function useChartTooltip(labels: readonly string[]) {
  const id = useId();
  const [active, setActive] = useState<ActivePoint | null>(null);
  const show = (
    index: number,
    element: Element,
    pointer?: { clientX: number; clientY: number },
  ) => {
    const box = element.getBoundingClientRect();
    setActive({
      element,
      index,
      x: pointer?.clientX ?? box.left + box.width / 2,
      y: pointer?.clientY ?? box.bottom,
    });
  };
  const dismiss = () => {
    setActive(null);
  };
  useEffect(() => {
    if (active === null) return undefined;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !active.element.contains(event.target)) setActive(null);
    };
    const close = () => {
      setActive(null);
    };
    const scroll = () => {
      if (document.activeElement !== active.element) {
        close();
        return;
      }
      const box = active.element.getBoundingClientRect();
      setActive({ ...active, x: box.left + box.width / 2, y: box.bottom });
    };
    document.addEventListener('pointerdown', outside);
    window.addEventListener('scroll', scroll, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('scroll', scroll, true);
      window.removeEventListener('resize', close);
    };
  }, [active]);
  const target = (index: number) => ({
    tabIndex: 0,
    role: 'img' as const,
    'aria-label': labels[index],
    'aria-describedby': active?.index === index ? id : undefined,
    'data-chart-target': true,
    onPointerEnter: (event: React.PointerEvent) => {
      show(index, event.currentTarget, event);
    },
    onPointerMove: (event: React.PointerEvent) => {
      show(index, event.currentTarget, event);
    },
    onPointerDown: (event: React.PointerEvent) => {
      show(index, event.currentTarget, event);
    },
    onPointerLeave: (event: React.PointerEvent) => {
      if (event.pointerType !== 'touch') dismiss();
    },
    onFocus: (event: React.FocusEvent) => {
      show(index, event.currentTarget);
    },
    onBlur: dismiss,
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
    },
  });
  const text = active === null ? undefined : labels[active.index];
  return {
    active: active?.index ?? null,
    target,
    show,
    dismiss,
    tooltip:
      active !== null && text !== undefined
        ? createPortal(<Tooltip key={text} id={id} point={active} text={text} />, document.body)
        : null,
  };
}

function Tooltip({ id, point, text }: { id: string; point: ActivePoint; text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: 8, top: 8 });
  useLayoutEffect(() => {
    const box = ref.current?.getBoundingClientRect();
    if (box === undefined) return;
    setPosition({
      left: Math.max(8, Math.min(point.x - box.width / 2, window.innerWidth - box.width - 8)),
      top: Math.max(
        8,
        Math.min(
          window.innerHeight - box.height - 8,
          point.y + box.height + 20 < window.innerHeight ? point.y + 16 : point.y - box.height - 16,
        ),
      ),
    });
  }, [point]);
  return (
    <div
      ref={ref}
      id={id}
      role="tooltip"
      {...stylex.props(styles.tooltip, styles.position(position.left, position.top))}
    >
      {text}
    </div>
  );
}

const styles = stylex.create({
  tooltip: {
    position: 'fixed',
    zIndex: 1000,
    width: 'max-content',
    maxWidth: 'min(280px, calc(100vw - 16px))',
    padding: space.sm,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: 8,
    fontSize: 13,
    lineHeight: 1.5,
    whiteSpace: 'pre-line',
    fontVariantNumeric: 'tabular-nums',
    color: colors.text,
    backgroundColor: colors.surface,
    boxShadow: '0 4px 16px rgb(0 0 0 / 0.12)',
    pointerEvents: 'none',
  },
  position: (left: number, top: number) => ({ left, top }),
});
