import React, { useState, useEffect, Fragment } from "react";
import { useLazyQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
// import "typeface-roboto";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import Grow from "@material-ui/core/Grow";

import { useThrottle } from "../utils";

export const SEARCH_PLAYER = gql`
  query searchPlayers($name: String!) {
    findPlayers(name: $name) {
      __typename
      id
      name
      fk
      teamFk
      teamName
      teamShort
      position
      url
    }
  }
`;

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper
  },
  inline: {
    display: "inline"
  }
}));

export const PlayerItem = props => {
  const { player, classes, style } = props;

  return (
    <Fragment>
      <ListItem alignItems="flex-start" style={style}>
        <ListItemAvatar>
          <Avatar
            alt={player.name}
            src={`https://d395i9ljze9h3x.cloudfront.net/req/20180910/images/headshots/${player.id}_2018.jpg`}
          />
        </ListItemAvatar>
        <ListItemText
          primary={player.name}
          secondary={
            <React.Fragment>
              <Typography
                component="span"
                variant="body2"
                className={classes.inline}
                color="textPrimary"
              >
                {player.teamName}
              </Typography>
              &nbsp; - {player.position}
            </React.Fragment>
          }
        />
      </ListItem>
      <Divider variant="inset" component="li" />
    </Fragment>
  );
};

export function PlayerSearch() {
  const [execute, { loading, data, error }] = useLazyQuery(SEARCH_PLAYER);
  const search = useThrottle(execute, 300);
  const classes = useStyles();

  let msg;
  if (loading) msg = "Loading...";
  if (error) msg = `Error: ${error.message}`;
  console.log(loading, error, data);

  const onChange = e => {
    const name = e.target.value;
    if (name.length == 0) return;
    search({ variables: { name } });
  };

  return (
    <Fragment>
      <input type="text" onChange={onChange} />
      <p>{msg}</p>
      <List className={classes.root}>
        {data &&
          data.findPlayers &&
          data.findPlayers.map(player => (
            <Grow key={player.id} in={true} timeout={400}>
              <PlayerItem player={player} classes={classes} />
            </Grow>
          ))}
      </List>
    </Fragment>
  );
}
