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

export default function JobsCarousel({ jobs }: { jobs: JobsQueryJob[] }) {
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
    maxServerRender: 5,
  });

  console.log({ visibleElements });

  return (
    <div>
      <p>
        Currently Visible: {offset} -{" "}
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
  const [offset, setOffset] = useState(0);
  const [trigger, setTrigger] = useState(Math.random());
  const forceUpdate = useMemo(
    () =>
      debounce(() => {
        setTrigger(Math.random());
      }, 100),
    [setTrigger]
  );

  const paddedItems = useMemo<Item[]>(() => {
    return Array(20)
      .fill(true)
      .map((_item, idx) => {
        return {
          id: `padding-${idx}`,
        };
      });
  }, []);

  const visibleElements = useMemo(() => {
    return (
      items
        // if we're on the client side, prefer the current slots we can see.
        // if we're on the server side, the maximum we're going to render is defined outside.
        .slice(
          offset,
          offset + (visibilityList.current.size || maxServerRender)
        )
        .concat(paddedItems)
    );
  }, [items, offset, paddedItems, maxServerRender, trigger]);

  // recompute once on hydrate
  useEffect(() => {
    forceUpdate();
  }, [forceUpdate]);

  useEffect(() => {
    window.addEventListener('resize', forceUpdate)

    return () => {
      window.removeEventListener('resize', forceUpdate)
    }
  }, [forceUpdate])

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
