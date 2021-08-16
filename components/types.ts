export type JobsQueryJob = {
  id: string;
  company: {
    slug: string;
  };
  slug: string;
};

export type JobQueryJob = {
  id: string;
  company: {
    id: string;
    slug: string;
    websiteUrl: string;
  };
  slug: string;
};
