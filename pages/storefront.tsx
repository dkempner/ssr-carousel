/** @jsxImportSource @emotion/react */
import { jsx } from "@emotion/react";
import { useState, useCallback, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import { useInView } from "react-intersection-observer";
import JobsCarousel from "../components/JobsCarousel";

type JobsQueryJob = {
  id: string;
  company: {
    slug: string;
  };
  slug: string;
};

type JobsQueryJobsResult = {
  jobs: JobsQueryJob[];
};

export const JOBS_QUERY = gql`
  query Jobs {
    jobs {
      id
      company {
        slug
      }
      slug
    }
  }
`;

const ROWS_TO_LOAD = 4;

function Storefront() {
  const carouselQuery = useQuery<JobsQueryJobsResult>(JOBS_QUERY);
  const [visibleRows, setVisibleRows] = useState(ROWS_TO_LOAD);

  const loadMore = useCallback(() => {
    setTimeout(() => {
      setVisibleRows((r) => r + ROWS_TO_LOAD);
    }, 750);
  }, []);

  const loadMoreButton = useInView();

  useEffect(() => {
    const { inView } = loadMoreButton;
    if (inView) loadMore();
  });

  return (
    <>
      <header
        css={{
          position: "sticky",
          top: 0,
          right: 0,
          left: 0,
          height: 80,
        }}
      >
        Header
      </header>
      <div
        css={{
          position: "fixed",
          width: 260,
          height: `calc(100% - 80px)`,
        }}
      >
        Side Nav
      </div>
      <div
        css={{
          height: "100%",
          marginLeft: 260,
          borderTop: "1px solid black",
          borderLeft: "1px solid black",
        }}
      >
        {carouselQuery.loading ? (
          <></>
        ) : (
          <>
            {Array(visibleRows)
              .fill(true)
              .map((_, idx) => (
                <JobsCarousel
                  key={idx}
                  number={idx}
                  jobs={carouselQuery.data?.jobs || []}
                ></JobsCarousel>
              ))}
            <div
              css={{
                marginTop: 40,
                marginBottom: 20,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <button ref={loadMoreButton.ref} onClick={loadMore}>
                Load More
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Storefront;
