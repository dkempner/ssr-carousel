/** @jsxImportSource @emotion/react */
import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { debounce } from "lodash";

type Item = {
  id: string;
};

type UseWidthDetectingCarouselProps = {
  items: Item[];
  maxServerRender: number;
  staticRenderCount?: number;
};

export function useWidthDetectingCarousel({
  items,
  maxServerRender,
  staticRenderCount,
}: UseWidthDetectingCarouselProps) {
  const visibilityList = useRef(new Set<string>());
  const maxSlots = useRef(maxServerRender);
  const [offset, setOffset] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setTrigger] = useState(Math.random());

  const forceUpdate = useMemo(() => {
    if (staticRenderCount) return () => {};
    return debounce(() => {
      setTrigger(Math.random());
    }, 500);
  }, [setTrigger, staticRenderCount]);

  const originalAdd = visibilityList.current.add.bind(visibilityList.current);
  visibilityList.current.add = (x: string) => {
    forceUpdate();
    return originalAdd(x);
  };

  const originalDelete = visibilityList.current.delete.bind(
    visibilityList.current
  );
  visibilityList.current.delete = (x: string) => {
    forceUpdate();
    return originalDelete(x);
  };

  const paddedItems = useMemo<Item[]>(() => {
    return Array(maxServerRender)
      .fill(true)
      .map((_item, idx) => {
        return {
          id: `padding-${idx}`,
        };
      });
  }, [maxServerRender]);

  const visibleElements = useMemo(() => {
    if (staticRenderCount) return items.slice(0, staticRenderCount);

    if (visibilityList.current.size > maxSlots.current) {
      maxSlots.current = visibilityList.current.size;
    }
    return (
      items
        // if we're on the client side, prefer the current slots we can see.
        // if we're on the server side, the maximum we're going to render is defined outside.
        .slice(
          offset,
          offset + Math.max(visibilityList.current.size, maxSlots.current) ||
            maxServerRender
        )
        .concat(paddedItems)
    );
  }, [
    staticRenderCount,
    items,
    offset,
    maxSlots,
    paddedItems,
    maxServerRender,
  ]);

  // recompute once on hydrate
  useEffect(() => {
    forceUpdate();
  }, [forceUpdate]);

  useEffect(() => {
    const setMaxSlots = debounce(() => {
      maxSlots.current = Array.from(visibilityList.current).filter(
        (l) => !l.includes("-padding")
      ).length;
      forceUpdate();
    }, 500);

    window.addEventListener("resize", setMaxSlots);

    return () => {
      window.removeEventListener("resize", setMaxSlots);
    };
  }, [forceUpdate]);

  useEffect(() => {
    maxSlots.current = Array.from(visibilityList.current).filter(
      (l) => !l.includes("-padding")
    ).length;
    forceUpdate();
  }, [forceUpdate]);

  const showPrevious = useCallback(() => {
    const visibleCount = visibilityList.current.size;
    const desired = offset - visibleCount;
    setOffset(desired >= 0 ? desired : 0);
  }, [offset]);

  const showNext = useCallback(() => {
    const visibleCount = visibilityList.current.size;
    setOffset(offset + visibleCount);
  }, [offset]);

  const previousDisabled = useMemo(() => {
    return offset === 0;
  }, [offset]);

  const nextDisabled = useMemo(() => {
    return offset + visibilityList.current.size > items.length - 1;
  }, [offset, items]);

  const totalPages = staticRenderCount
    ? 1
    : Math.ceil(items.length / maxSlots.current);

  const currentPage = staticRenderCount
    ? 1
    : Math.ceil(offset / maxSlots.current) + 1;

  return {
    visibleElements,
    visibilityList,
    offset,
    showPrevious,
    showNext,
    previousDisabled,
    nextDisabled,
    currentPage,
    totalPages,
  };
}
