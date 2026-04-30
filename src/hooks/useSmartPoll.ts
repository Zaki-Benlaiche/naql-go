import { useEffect, useRef } from "react";

/**
 * Polls `fn` every `ms` milliseconds.
 * - Pauses while the browser tab is hidden (saves DB calls)
 * - Immediately refetches when the tab becomes visible again
 * - Always calls the latest version of `fn` (ref pattern — no stale closures)
 */
export function useSmartPoll(fn: () => void, ms: number) {
  const ref = useRef(fn);
  ref.current = fn;

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;

    function schedule() {
      if (stopped) return;
      timerId = setTimeout(() => {
        if (!stopped && document.visibilityState !== "hidden") {
          ref.current();
        }
        schedule();
      }, ms);
    }

    function onVisible() {
      if (document.visibilityState === "visible" && !stopped) {
        ref.current();                        // instant refetch on tab focus
        if (timerId) clearTimeout(timerId);
        schedule();
      }
    }

    schedule();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      if (timerId) clearTimeout(timerId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [ms]); // restart only when interval changes
}
