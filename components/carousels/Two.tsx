/** @jsxImportSource @emotion/react */
import { jsx } from "@emotion/react";
import { useMemo } from "react";
import Job from "../jobs/JobFixedWidth";
import { useWidthDetectingCarousel } from "../useWidthDetectingCarousel";
import type { JobsQueryJob } from "../types";

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
    maxServerRender: 25,
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
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          height: 250,
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
