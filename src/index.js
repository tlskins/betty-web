import React from "react";
import ReactDOM from "react-dom";

import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { ApolloProvider, useQuery } from "@apollo/react-hooks";
import { split } from "apollo-link";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import indigo from "@material-ui/core/colors/indigo";

import "./css/tailwind.css";
import Pages from "./pages";

import "typeface-roboto-condensed";
// require("typeface-roboto-condensed");
// import { resolvers, typeDefs } from "./resolvers";
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
  link,
  cache: new InMemoryCache()
});

if (module.hot) {
  module.hot.accept("./pages", () => {
    const NextApp = require("./pages").default;
    render(<NextApp />);
  });
}

// const THEME = createMuiTheme({
//   typography: {
//     fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
//     fontSize: 14,
//     fontWeightLight: 300,
//     fontWeightRegular: 400,
//     fontWeightMedium: 500
//   }
// });

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#ffb74d"
    },
    secondary: indigo
  },
  typography: {
    fontFamily: [
      "Nunito",
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif"
    ].join(",")
  }
});

function render(component) {
  ReactDOM.render(
    <ApolloProvider client={apolloClient}>
      <ThemeProvider theme={theme}>{component}</ThemeProvider>
    </ApolloProvider>,
    document.getElementById("root")
  );
}

render(<Pages />);
