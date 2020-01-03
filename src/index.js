import React from "react";
import ReactDOM from "react-dom";

import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { ApolloProvider, useQuery } from "@apollo/react-hooks";
import { split } from "apollo-link";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";

// import "typeface-roboto";

import Pages from "./pages";
import { resolvers, typeDefs } from "./resolvers";
// import injectStyles from "./styles";

const wsLink = new WebSocketLink({
  uri: `ws://localhost:8080/query`,
  options: {
    reconnect: true
  }
});

const httpLink = new HttpLink({ uri: "http://localhost:8080/query" });

// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === "OperationDefinition" && operation === "subscription";
  },
  wsLink,
  httpLink
);

const apolloClient = new ApolloClient({
  link: link,
  cache: new InMemoryCache()
});

if (module.hot) {
  module.hot.accept("./pages", () => {
    const NextApp = require("./pages").default;
    render(<NextApp />);
  });
}

function render(component) {
  ReactDOM.render(
    <ApolloProvider client={apolloClient}>{component}</ApolloProvider>,
    document.getElementById("root")
  );
}

render(<Pages />);

// const cache = new InMemoryCache();
// const client = new ApolloClient({
//   cache,
//   link: new HttpLink({
//     uri: "http://localhost:8080/query",
//     headers: {
//       "client-name": "Betty",
//       "client-version": "1.0.0"
//     }
//   }),
//   resolvers,
//   typeDefs
// });

// ReactDOM.render(
//   <ApolloProvider client={client}>
//     <Pages />
//   </ApolloProvider>,
//   document.getElementById("root")
// );
