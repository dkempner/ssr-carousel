/** @jsxImportSource @emotion/react */
import { jsx } from "@emotion/react";
import { useQuery, gql } from "@apollo/client";
import facepaint from "facepaint";
import { useEffect, MutableRefObject, memo } from "react";
import { useInView } from "react-intersection-observer";

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

type JobsQueryJob = {
  id: string;
  company: {
    slug: string;
  };
  slug: string;
};

const mediaQueries = facepaint([
  "@media(min-width: 768px)",
  "@media(min-width: 1024px)",
  "@media(min-width: 1280px)",
]);

const itemWidth = (num: number) => {
  return `calc(100% / ${num})`;
};

export default function Job({
  job,
  id,
  visibilityList,
}: {
  job?: JobsQueryJob;
  id: string;
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
    if (inView && id) {
      visibilityList.current.add(id);
    }

    return () => {
      id && visibilityList.current.delete(id);
    };
  }, [inView, id, visibilityList]);

  return (
    <li
      ref={inViewRef}
      css={mediaQueries({
        display: "inline-block",
        width: [itemWidth(2), itemWidth(4), itemWidth(5), itemWidth(8)],
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
