import React, { useState, Fragment } from "react";
import { useSubscription } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import InfoIcon from "@material-ui/icons/Info";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import { amber, green } from "@material-ui/core/colors";

export const Subscription = gql`
  subscription MoreArticles {
    rotoArticleAdded {
      id
      playerName
      position
      team
      title
      article
      scrapedAt
    }
  }
`;

const useStyles = makeStyles(theme => ({
  info: {
    backgroundColor: theme.palette.primary.main,
    margin: theme.spacing(1)
  },
  icon: {
    fontSize: 20
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1)
  },
  message: {
    display: "flex",
    alignItems: "center"
  }
}));

export function RotoAlerts() {
  const [open, setOpen] = useState(false);
  const { data } = useSubscription(Subscription, {
    onSubscriptionData: () => setOpen(true)
  });
  const classes = useStyles();

  if (!data || !data.rotoArticleAdded) {
    return null;
  }

  const { id, title, playerName, article } = data.rotoArticleAdded;

  return (
    <Snackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left"
      }}
      open={open}
      autoHideDuration={12000}
      onClose={() => setOpen(false)}
    >
      <SnackbarContent
        className={classes.info}
        aria-describedby="client-snackbar"
        message={
          <span id="client-snackbar" className={classes.message}>
            <InfoIcon className={classes.iconVariant} />
            {title}
          </span>
        }
        action={[
          <IconButton
            key="close"
            aria-label="close"
            color="inherit"
            onClick={() => setOpen(false)}
          >
            <CloseIcon className={classes.icon} />
          </IconButton>
        ]}
      />
    </Snackbar>
  );
}
