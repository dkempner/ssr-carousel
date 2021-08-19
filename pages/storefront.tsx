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
        id
        slug
      }
      slug
    }
  }
`;

const ROWS_TO_LOAD = 4;

const modToComponent = [
  (props: any) => {
    return (
      <>
        <h1>Overfetch + Media Query Width</h1>
        <JobsCarousel {...props} width={"MediaQuery"} maxServerRender={25} />
      </>
    );
  },
  (props: any) => {
    return (
      <>
        <h1>Overfetch + Fixed Width</h1>
        <JobsCarousel {...props} width={"Fixed"} maxServerRender={25} />
      </>
    );
  },
  (props: any) => {
    return (
      <>
        <h1>Underfetch + Media Query Width</h1>
        <JobsCarousel {...props} width={"MediaQuery"} maxServerRender={5} />
      </>
    );
  },
  (props: any) => {
    return (
      <>
        <h1>Underfetch + Fixed Width</h1>
        <JobsCarousel {...props} width={"Fixed"} maxServerRender={5} />
      </>
    );
  },
];

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
              .map((_, idx) => {
                const Component = modToComponent[idx % 4];
                return (
                  <Component
                    key={idx}
                    number={idx}
                    jobs={carouselQuery.data?.jobs || []}
                  ></Component>
                );
              })}
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
