import { useEffect, useState } from 'react';

/**
 * The id of the section crossing the middle of the viewport, for a scroll-spy menu.
 * Falls back to the first id where IntersectionObserver is missing.
 */
export function useActiveChapter<Id extends string>(ids: readonly Id[]): Id | undefined {
  const [active, setActive] = useState<Id | undefined>(ids[0]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = ids.find((candidate) => candidate === entry.target.id);
          if (entry.isIntersecting && id !== undefined) setActive(id);
        }
      },
      // A thin band across the middle of the screen: whichever chapter covers it is current.
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const id of ids) {
      const element = document.getElementById(id);
      if (element !== null) observer.observe(element);
    }
    return () => {
      observer.disconnect();
    };
  }, [ids]);

  return active;
}
