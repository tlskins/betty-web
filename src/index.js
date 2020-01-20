import React from "react";
import ReactDOM from "react-dom";

import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { ApolloProvider } from "@apollo/react-hooks";
import { WebSocketLink } from "apollo-link-ws";

import Pages from "./pages";

const wsLink = new WebSocketLink({
  uri: `ws://ec2-18-207-208-175.compute-1.amazonaws.com:8080/query`,
  options: {
    reconnect: true
  }
});

const httpLink = new HttpLink({
  uri: "http://ec2-18-207-208-175.compute-1.amazonaws.com:8080/query"
});

// const wsLink = new WebSocketLink({
//   uri: `ws://localhost:8080/query`,
//   options: {
//     reconnect: true
//   }
// });

// const httpLink = new HttpLink({ uri: "http://localhost:8080/query" });

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
  link,
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
