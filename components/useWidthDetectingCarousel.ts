/** @jsxImportSource @emotion/react */
import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { debounce } from "lodash";

type Item = {
  id: string;
};

type UseWidthDetectingCarouselProps = {
  items: Item[];
  maxServerRender: number;
};

export function useWidthDetectingCarousel({
  items,
  maxServerRender,
}: UseWidthDetectingCarouselProps) {
  const visibilityList = useRef(new Set<string>());
  const maxSlots = useRef(maxServerRender);
  const [offset, setOffset] = useState(0);
  const [_, setTrigger] = useState(Math.random());

  const forceUpdate = useMemo(() => {
    return debounce(() => {
      setTrigger(Math.random());
    }, 100);
  }, [setTrigger]);

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
    if (visibilityList.current.size > maxSlots.current) {
      maxSlots.current = visibilityList.current.size;
    }
    console.log({
      visibilityList: visibilityList.current.size,
      maxSlots: maxSlots.current,
    });
    return (
      items
        // if we're on the client side, prefer the current slots we can see.
        // if we're on the server side, the maximum we're going to render is defined outside.
        .slice(
          offset,
          offset +
            (Math.max(visibilityList.current.size, maxSlots.current) ||
              maxServerRender)
        )
        .concat(paddedItems)
    );
  }, [items, offset, maxSlots, paddedItems, maxServerRender]);

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
    console.log("should only see this run once per row");
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

  return {
    visibleElements,
    visibilityList,
    offset,
    showPrevious,
    showNext,
    previousDisabled,
    nextDisabled,
  };
}
