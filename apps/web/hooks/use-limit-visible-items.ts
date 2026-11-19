import { useLayoutEffect, useRef } from "react";

export function useLimitVisibleItems(maxVisible: number, itemCount: number) {
  const listRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const limitHeight = () => {
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

function getItems(element: Element): Element[] {
  return Array.from(element.children).flatMap((child) =>
    getComputedStyle(child).display === "contents" ? getItems(child) : [child],
  );
}
