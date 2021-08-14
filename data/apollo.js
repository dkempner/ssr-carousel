import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

const isServer = typeof window === "undefined";
const windowApolloState = !isServer && window.__NEXT_DATA__.apolloState;

console.clear();
let CLIENT;

export function getApolloClient(forceNew) {
  if (!CLIENT || forceNew) {
    CLIENT = new ApolloClient({
      ssrMode: isServer,
      uri: "https://api.graphql.jobs/",
      cache: new InMemoryCache().restore(windowApolloState || {})
    });
  }

  return CLIENT;
}

export const QUERY = gql`
  query Jobs {
    jobs {
      id
      title
      postedAt
    }
  }
`;