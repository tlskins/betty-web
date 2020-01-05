import React, { useState, useEffect, Fragment } from "react";
import { useLazyQuery, useSubscription } from "@apollo/react-hooks";
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
import { RotoAlerts } from "./rotoAlerts";

export const SEARCH_PLAYER = gql`
  query searchPlayers($name: String!) {
    findPlayers(name: $name, withGame: true) {
      __typename
      id
      name
      fk
      teamFk
      teamName
      teamShort
      position
      url
      game {
        name
        awayTeamFk
        awayTeamName
        homeTeamFk
        homeTeamName
      }
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
  },
  item: {
    // backgroundColor: "WhiteSmoke",
    // borderStyle: "solid",
    // borderWidth: "1px",
    // borderColor: "Silver",
    // borderRadius: "7px",
    marginTop: "2px"
  }
}));

export const PlayerItem = props => {
  const { player, classes, style } = props;
  const { game } = player;

  let vs;
  if (game) {
    vs =
      game.awayTeamFk == player.teamFk ? game.homeTeamName : game.awayTeamName;
  }

  return (
    <Fragment>
      <ListItem alignItems="flex-start" className={classes.item} style={style}>
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
              &nbsp; - {player.position} {vs ? `vs ${vs}` : "No game this week"}
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
      <RotoAlerts />
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
