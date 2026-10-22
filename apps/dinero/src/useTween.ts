import { useEffect, useRef, useState } from 'react';

const DURATION = 650;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function canAnimate(): boolean {
  if (typeof requestAnimationFrame !== 'function') return false;
  return !(
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Animates a list of numbers towards `target` whenever it changes, so charts morph from
 * one state to the next instead of jumping. Jumps straight there when motion is reduced
 * or the browser can't animate.
 */
export function useTween(target: readonly number[]): readonly number[] {
  const [current, setCurrent] = useState(target);
  const shown = useRef(target);
  // Compare by value, so callers can pass a fresh array on every render. String(number)
  // round-trips exactly, so the key carries the target itself.
  const key = target.join(',');
  const animated = canAnimate();

  useEffect(() => {
    if (!animated) return undefined;
    const goal = key === '' ? [] : key.split(',').map(Number);
    const origin = shown.current;
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      const eased = easeInOut(t);
      const next = goal.map((value, index) => {
        const from = origin[index] ?? value;
        return from + (value - from) * eased;
      });
      shown.current = next;
      setCurrent(next);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [key, animated]);

  return animated ? current : target;
}
