import React, { useState } from "react";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import InfoIcon from "@material-ui/icons/Info";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";

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

export function Alert({ title, open, onClose }) {
  const classes = useStyles();

  return (
    <Snackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left"
      }}
      open={open}
      autoHideDuration={12000}
      onClose={onClose}
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
            onClick={onClose}
          >
            <CloseIcon className={classes.icon} />
          </IconButton>
        ]}
      />
    </Snackbar>
  );
}
