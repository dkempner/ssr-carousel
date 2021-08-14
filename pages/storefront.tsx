/** @jsxImportSource @emotion/react */
import { jsx } from "@emotion/react";
import { useQuery, gql } from "@apollo/client";
import JobsCarousel from '../components/JobsCarousel'

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


function Storefront() {
  const firstCarousel = useQuery<JobsQueryJobsResult>(JOBS_QUERY);

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
        {firstCarousel.loading ? (
          <></>
        ) : (
          <JobsCarousel jobs={firstCarousel.data?.jobs || []}></JobsCarousel>
        )}
      </div>
    </>
  );
}

export default Storefront;
