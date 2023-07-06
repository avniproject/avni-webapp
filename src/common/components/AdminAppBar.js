import React from "react";
import { AppBar } from "react-admin";
import Typography from "@material-ui/core/Typography";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { getUserInfo } from "../../rootApp/ducks";
import { OrganisationOptions } from "./OrganisationOptions";

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
  const {
    organisation,
    authSession,
    history,
    staticContext,
    dispatch,
    organisations,
    userInfo,
    ...rest
  } = props;
  return (
    <AppBar {...rest}>
      <Typography variant="h6" color="inherit" className={classes.title} id="react-admin-title" />
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
