/** @jsxImportSource @emotion/react */
import { jsx } from "@emotion/react";
import {
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
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
    maxVisible: 10,
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
  maxVisible: number;
};

function useWidthDetectingCarousel({
  items,
  maxVisible,
}: UseWidthDetectingCarouselProps) {
  const visibilityList = useRef(new Set<string>());
  const [offset, setOffset] = useState(0);

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
    const withPadding = items.concat(paddedItems);
    return withPadding.slice(offset, offset + maxVisible);
  }, [items, offset, paddedItems, maxVisible]);

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
