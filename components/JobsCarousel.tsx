/** @jsxImportSource @emotion/react */
import { CSSObject, jsx } from "@emotion/react";
import { useMemo } from "react";
import Job from "./Job";
import { useWidthDetectingCarousel } from "./useWidthDetectingCarousel";
import type { JobsQueryJob, WidthVariant } from "./types";

const FixedWidthStyles: CSSObject = {
  listStyle: "none",
  overflowX: "hidden",
  whiteSpace: "nowrap",
  margin: 0,
  padding: 0,
  display: "grid",
  gridTemplateColumns: `repeat(auto-fill, 110px)`,
  justifyContent: "space-between",
  gridAutoFlow: 'column',
  gridGap: 16,
  height: 250,
};

const MediaQueryStyles: CSSObject = {
  listStyle: "none",
  overflowX: "hidden",
  whiteSpace: "nowrap",
  margin: 0,
  padding: 0,
  display: "block",
  height: 250,
};

export default function JobsCarousel({
  jobs,
  number,
  maxServerRender,
  width,
}: {
  jobs: JobsQueryJob[];
  number: number;
  maxServerRender: number;
  width: WidthVariant;
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
    maxServerRender,
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
      <ul css={width === "Fixed" ? FixedWidthStyles : MediaQueryStyles}>
        {visibleElements?.map((item) => (
          <Job
            key={item.id}
            id={item.id}
            job={jobById[item.id]}
            visibilityList={visibilityList}
            width={width}
          />
        ))}
      </ul>
    </div>
  );
}
