import "../styles/globals.css";
import App from "next/app";
import type { AppProps, AppContext } from "next/app";
import MobileDetect from "mobile-detect";

import { ApolloProvider } from "@apollo/client";
import { getApolloClient } from "../data/apollo";
import { IsMobileContext } from "../components/useIsMobile";

function MyApp(props: any) {
  const { Component, pageProps } = props;
  const client = getApolloClient();
  return (
    <IsMobileContext.Provider value={props.isMobile}>
      <ApolloProvider client={client}>
        <Component {...pageProps} />
      </ApolloProvider>
    </IsMobileContext.Provider>
  );
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext);
  const isMobile = !!new MobileDetect(
    appContext.ctx.req?.headers["user-agent"] || ""
  ).mobile();
  
  return {
    ...appProps,
    isMobile
  }
};

export default MyApp;
