/** @jsxImportSource @emotion/react */
import { jsx } from "@emotion/react";
import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { debounce } from "lodash";
import Job from "./Job";

type JobsQueryJob = {
  id: string;
  company: {
    slug: string;
  };
  slug: string;
};

type Item = {
  id: string;
};

export default function JobsCarousel({
  jobs,
  number,
}: {
  jobs: JobsQueryJob[];
  number: number;
}) {
  const ids = jobs.map((j) => j.id);

  const jobById = useMemo(() => {
    const hash: Record<string, JobsQueryJob> = {};
    jobs.forEach((j) => {
      hash[j.id] = j;
    });
    return hash;
  }, [jobs]);

  const {
    visibleElements,
    visibilityList,
    offset,
    showPrevious,
    showNext,
    previousDisabled,
    nextDisabled,
  } = useWidthDetectingCarousel({
    items: ids.map((id) => ({ id })),
    maxServerRender: 6,
  });

  return (
    <div>
      <p>
        ({number}) Currently Visible: {offset} -{" "}
        {offset + (visibilityList.current.size - 1)}
      </p>
      <div>
        <button onClick={showPrevious} disabled={previousDisabled}>
          Previous
        </button>
        <button onClick={showNext} disabled={nextDisabled}>
          Next
        </button>
      </div>
      <ul
        css={{
          listStyle: "none",
          overflowX: "hidden",
          whiteSpace: "nowrap",
          margin: 0,
          padding: 0,
        }}
      >
        {visibleElements?.map((item) => (
          <Job
            key={item.id}
            id={item.id}
            job={jobById[item.id]}
            visibilityList={visibilityList}
          />
        ))}
      </ul>
    </div>
  );
}

type UseWidthDetectingCarouselProps = {
  items: Item[];
  maxServerRender: number;
};

function useWidthDetectingCarousel({
  items,
  maxServerRender,
}: UseWidthDetectingCarouselProps) {
  const visibilityList = useRef(new Set<string>());
  const maxSlots = useRef(maxServerRender);
  const [offset, setOffset] = useState(0);
  const [_, setTrigger] = useState(Math.random());

  const forceUpdate = useMemo(() => {
    return debounce(() => {
      // @ts-ignore
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
    return (
      items
        // if we're on the client side, prefer the current slots we can see.
        // if we're on the server side, the maximum we're going to render is defined outside.
        .slice(
          offset,
          offset + Math.max(visibilityList.current.size, maxSlots.current)
        )
        .concat(paddedItems)
    );
  }, [items, offset, maxSlots, paddedItems]);

  // recompute once on hydrate
  useEffect(() => {
    forceUpdate();
  }, [forceUpdate]);

  // // debounced recompute on resize
  // useEffect(() => {
  //   window.addEventListener("resize", forceUpdate);
  //   return () => {
  //     window.removeEventListener("resize", forceUpdate);
  //   };
  // }, [forceUpdate]);

  // // debounced recompute on scroll in
  // // case carousel is out of the viewport
  // useEffect(() => {
  //   window.addEventListener("scroll", forceUpdate);
  //   return () => {
  //     window.removeEventListener("scroll", forceUpdate);
  //   };
  // }, [forceUpdate]);

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
