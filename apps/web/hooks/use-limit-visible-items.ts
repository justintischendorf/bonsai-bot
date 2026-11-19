import { useLayoutEffect, useRef } from "react";

/**
 * Caps a wrapping list at the height of its first `maxVisible` items, so the rest
 * is reached by scrolling. CSS alone can't do this: the height depends on how many
 * columns currently fit. The list needs an overflow style of its own.
 */
export function useLimitVisibleItems(maxVisible: number, itemCount: number) {
  const listRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const limitHeight = () => {
      // A hidden list has no layout to measure; showing it triggers the observer.
      if (list.clientWidth === 0) return;

      const items = getItems(list);
      const lastVisible = items[maxVisible - 1];
      if (!lastVisible || items.length <= maxVisible) {
        list.style.maxHeight = "";
        return;
      }

      const listTop = list.getBoundingClientRect().top - list.scrollTop;
      const height = lastVisible.getBoundingClientRect().bottom - listTop;
      list.style.maxHeight = `${height}px`;
    };

    limitHeight();

    // Deferred to a frame: resizing the observed list inside the callback would
    // raise a "ResizeObserver loop" error.
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(limitHeight);
    });
    observer.observe(list);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [maxVisible, itemCount]);

  return listRef;
}

// Wrappers with `display: contents` (e.g. Ghost) have no box of their own, so the
// items laid out by the list are their children
function getItems(element: Element): Element[] {
  return Array.from(element.children).flatMap((child) =>
    getComputedStyle(child).display === "contents" ? getItems(child) : [child],
  );
}
