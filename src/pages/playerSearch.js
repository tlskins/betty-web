import React, { useState, useEffect, Fragment } from "react";
import { useLazyQuery, useSubscription } from "@apollo/react-hooks";
import gql from "graphql-tag";
import "typeface-roboto";
import { makeStyles, createMuiTheme } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";

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
  searchRoot: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.primary,
    borderRadius: "17px"
  },
  listRoot: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    width: 400
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
  },
  input: {
    marginLeft: theme.spacing(6),
    flex: 1
  },
  iconButton: {
    padding: 10
  }
  // divider: {
  //   height: 28,
  //   margin: 4
  // }
}));

export const PlayerItem = props => {
  const { player, classes, style, onSelect } = props;
  const { game } = player;

  let vs;
  if (game) {
    vs =
      game.awayTeamFk == player.teamFk ? game.homeTeamName : game.awayTeamName;
  }

  return (
    <Fragment>
      <ListItem
        alignItems="flex-start"
        className={classes.item}
        style={style}
        onClick={() => onSelect(player)}
      >
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

export function PlayerSearch({ onSelect }) {
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
      <p>{msg}</p>

      <Paper component="form" className={classes.searchRoot}>
        <IconButton className={classes.iconButton} aria-label="menu">
          <MenuIcon />
        </IconButton>
        <InputBase
          className={classes.input}
          placeholder="Search player or team"
          inputProps={{ "aria-label": "search player team" }}
          autoFocus={true}
          onChange={onChange}
        />
      </Paper>

      <List className={classes.listRoot}>
        {data &&
          data.findPlayers &&
          data.findPlayers.map(player => (
            <Grow key={player.id} in={true} timeout={400}>
              <PlayerItem
                player={player}
                classes={classes}
                onSelect={onSelect}
              />
            </Grow>
          ))}
      </List>
    </Fragment>
  );
}
