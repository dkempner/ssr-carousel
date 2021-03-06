/** @jsxImportSource @emotion/react */
import { CSSObject, jsx } from "@emotion/react";
import { useMemo } from "react";
import Job from "./Job";
import { useWidthDetectingCarousel } from "./useWidthDetectingCarousel";
import type { JobsQueryJob, WidthVariant } from "./types";
import { useIsMobile } from "./useIsMobile";

const FixedWidthStyles: CSSObject = {
  listStyle: "none",
  overflowX: "hidden",
  whiteSpace: "nowrap",
  margin: 0,
  padding: 0,
  display: "grid",
  gridTemplateColumns: `repeat(1000, 157px)`,
  justifyContent: "space-between",
  gridAutoFlow: "column",
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
  const isMobile = useIsMobile();
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
    currentPage,
    totalPages,
  } = useWidthDetectingCarousel({
    items: ids.map((id) => ({ id })),
    maxServerRender,
    staticRenderCount: isMobile ? 20 : undefined,
  });

  return (
    <div>
      <p>
        ({number}) Currently Visible: {offset} -{" "}
        {offset + (visibilityList.current.size - 1)}
      </p>
      <p>{`Page ${currentPage} / ${totalPages}`}</p>
      <div>
        <button onClick={showPrevious} disabled={previousDisabled}>
          Previous
        </button>
        <button onClick={showNext} disabled={nextDisabled}>
          Next
        </button>
      </div>
      <ul
        css={[
          width === "Fixed" ? FixedWidthStyles : MediaQueryStyles,
          {
            ...(isMobile
              ? {
                  overflowX: "scroll",
                  gridTemplateColumns: "repeat(20, 157px)",
                }
              : {}),
          },
        ]}
      >
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
