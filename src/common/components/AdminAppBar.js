import React from "react";
import { AppBar } from "react-admin";
import { makeStyles, withStyles } from "@mui/styles";
import { Typography, IconButton } from "@mui/material";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { getUserInfo } from "../../rootApp/ducks";
import { OrganisationOptions } from "./OrganisationOptions";
import { Home } from "@mui/icons-material";
import CurrentUserService from "../service/CurrentUserService";

const styles = {
  title: {
    flex: 1,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden"
  }
};

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    color: "white"
  },
  selectEmpty: {
    marginTop: theme.spacing(2)
  },
  whiteColor: {
    color: "white"
  }
}));

const AdminAppBar = withStyles(styles)(({ classes, getUserInfo, ...props }) => {
  const styles = useStyles();
  const { organisation, authSession, history, staticContext, dispatch, organisations, userInfo, ...rest } = props;
  return (
    <AppBar {...rest}>
      <Typography variant="h6" sx={{ color: "inherit" }} className={classes.title} id="react-admin-title" />
      <OrganisationOptions
        getUserInfo={getUserInfo}
        user={authSession}
        userInfo={userInfo}
        organisation={organisation}
        styles={styles}
        history={history}
        organisations={organisations}
      />
      <div>
        <b>{organisation.name} </b> ({authSession.username})
      </div>
      {CurrentUserService.hasOrganisationContext(userInfo) && (
        <IconButton onClick={() => history.push("/home")} aria-label="Home" color="inherit" size="large">
          <Home />
        </IconButton>
      )}
    </AppBar>
  );
});

const mapStateToProps = state => ({
  organisation: state.app.organisation,
  authSession: state.app.authSession,
  organisations: state.app.organisations,
  userInfo: state.app.userInfo
});

export default withRouter(
  connect(
    mapStateToProps,
    { getUserInfo }
  )(AdminAppBar)
);
