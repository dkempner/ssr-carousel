/** @jsxImportSource @emotion/react */
import { jsx } from "@emotion/react";
import { useQuery, gql } from "@apollo/client";
import facepaint from "facepaint";
import {
  useState,
  useEffect,
  useRef,
  useMemo,
  MutableRefObject,
  useCallback,
} from "react";
import { useInView } from "react-intersection-observer";

const mediaQueries = facepaint([
  "@media(min-width: 768px)",
  "@media(min-width: 1024px)",
  "@media(min-width: 1280px)",
]);

type Item = {
  id: string;
};

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

type JobQueryJob = {
  id: string;
};

type JobQueryJobResult = {
  job: JobQueryJob;
};

export const JOB_QUERY = gql`
  query Job($input: JobInput!) {
    job(input: $input) {
      id
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
          <Carousel jobs={firstCarousel.data?.jobs || []}></Carousel>
        )}
      </div>
    </>
  );
}

function Carousel({ jobs }: { jobs: JobsQueryJob[] }) {
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
    serverRenderedMax: 20,
  });
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

function Job({
  job,
  visibilityList,
}: {
  job?: JobsQueryJob;
  visibilityList: MutableRefObject<Set<string>>;
}) {
  const { data, error } = useQuery<JobQueryJobResult>(JOB_QUERY, {
    variables: {
      input: {
        companySlug: job?.company.slug,
        jobSlug: job?.slug,
      },
    },
    skip: !job,
  });

  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView && job) {
      visibilityList.current.add(job.id);
    }

    return () => {
      job && visibilityList.current.delete(job.id);
    };
  }, [inView, job, visibilityList]);

  return (
    <li
      ref={inViewRef}
      className={inView ? "visible" : ""}
      css={mediaQueries({
        display: "inline-block",
        width: ["50%", "25%", "20%", "12.5%"],
      })}
    >
      <div
        css={{
          width: "75%",
          overflow: "hidden",
        }}
      >
        <p>{data?.job.id}</p>
        <p>{job?.company.slug}</p>
        <p>{job?.slug}</p>
      </div>
    </li>
  );
}

type UseWidthDetectingCarouselProps = {
  items: Item[];
  serverRenderedMax: number;
};

function useWidthDetectingCarousel({
  items,
  serverRenderedMax,
}: UseWidthDetectingCarouselProps) {
  const visibilityList = useRef(new Set<string>());
  const [offset, setOffset] = useState(0);

  const paddedItems = useMemo<Item[]>(() => {
    return Array(20)
      .fill(true)
      .map((item, idx) => {
        return {
          id: `padding-${idx}`,
        };
      });
  }, []);

  const visibleElements = useMemo(() => {
    const withPadding = items.concat(paddedItems);
    return withPadding.slice(offset, offset + serverRenderedMax);
  }, [items, offset, paddedItems, serverRenderedMax]);

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
  }, [visibleElements, paddedItems]);

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

export default Storefront;
