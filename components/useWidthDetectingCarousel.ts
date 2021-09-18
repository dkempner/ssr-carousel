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

const wait = async (time: number) => {
  return new Promise((res) => {
    setTimeout(res, time);
  });
};

export function useWidthDetectingCarousel({
  items,
  maxServerRender,
  staticRenderCount,
}: UseWidthDetectingCarouselProps) {
  const visibilityList = useRef(new Map<string, number>());
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

  const originalSet = visibilityList.current.set.bind(visibilityList.current);
  visibilityList.current.set = (key: string, value: number) => {
    if (visibilityList.current.get(key) === value)
      return visibilityList.current;
    forceUpdate();
    return originalSet(key, value);
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

  const allIntersections = Array.from(visibilityList.current.values());
  const maxIntersection = Math.max(...allIntersections);
  const fullyVisibleItems = allIntersections.filter(
    (i) => i === maxIntersection
  ).length;

  const showPrevious = useCallback(() => {
    const desired = offset - fullyVisibleItems;
    setOffset(desired >= 0 ? desired : 0);
  }, [offset, fullyVisibleItems]);

  const showNext = useCallback(async ({startAnimation, endAnimation}) => {
    const nextOffsetStart = offset + fullyVisibleItems;
    const nextOffsetEnd = nextOffsetStart + visibilityList.current.size;
    const currentList = Array.from(visibilityList.current.keys());
    const nextBatch = items.slice(nextOffsetStart, nextOffsetEnd);
    const currentListExclusive = currentList.filter(
      (i) => !nextBatch.map((i) => i.id).includes(i)
    );

    nextBatch.forEach((i) => {
      visibilityList.current.set(i.id, 1);
    });

    startAnimation(nextBatch[0].id)

    await wait(250)

    // currentListExclusive.forEach((id) => {
    //   visibilityList.current.delete(id);
    //   console.log(visibilityList.current.size)
    // });

    endAnimation()

    // setOffset(offset + fullyVisibleItems);
  }, [offset, fullyVisibleItems, items]);

  const previousDisabled = useMemo(() => {
    return offset === 0;
  }, [offset]);

  const nextDisabled = useMemo(() => {
    return offset + visibilityList.current.size > items.length - 1;
  }, [offset, items]);

  const totalPages = staticRenderCount
    ? 1
    : Math.ceil(items.length / fullyVisibleItems);

  const currentPage = staticRenderCount
    ? 1
    : Math.ceil(offset / fullyVisibleItems) + 1;

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
