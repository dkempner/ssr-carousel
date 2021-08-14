/** @jsxImportSource @emotion/react */
import { jsx } from "@emotion/react";
import { useQuery, gql } from "@apollo/client";
import facepaint from "facepaint";
import { useEffect, MutableRefObject } from "react";
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

export default function Job({
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
