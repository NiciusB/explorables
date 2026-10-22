import { useEffect, useRef, useState } from 'react';

/** Tracks an element's content width; falls back to `initial` where ResizeObserver is missing. */
export function useElementWidth<Element extends HTMLElement>(initial: number) {
  const ref = useRef<Element>(null);
  const [width, setWidth] = useState(initial);

  useEffect(() => {
    const element = ref.current;
    if (element === null || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(([entry]) => {
      if (entry !== undefined) setWidth(entry.contentRect.width);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);

  return [ref, width] as const;
}
