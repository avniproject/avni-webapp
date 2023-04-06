import React from "react";
import { AppBar } from "react-admin";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";
import HomeIcon from "@material-ui/icons/Home";
import IconButton from "@material-ui/core/IconButton";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { getUserInfo } from "../../rootApp/ducks";
import { OrganisationOptions } from "./OrganisationOptions";
import { intersection, isEmpty } from "lodash";
import http from "common/utils/httpClient";
import { ROLES } from "../constants";
import { isAnyAdmin } from "../utils/General";

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
    ...rest
  } = props;
  return (
    <AppBar {...rest}>
      <Typography variant="h6" color="inherit" className={classes.title} id="react-admin-title" />
      <OrganisationOptions
        getUserInfo={getUserInfo}
        user={authSession}
        organisation={organisation}
        styles={styles}
        history={history}
        organisations={organisations}
      />
      <div>
        <b>{organisation.name} </b> ({authSession.username})
      </div>
      {(isEmpty(intersection(authSession.roles, [ROLES.ADMIN])) || !isEmpty(http.getOrgUUID())) && (
        <IconButton
          onClick={() =>
            isAnyAdmin(authSession.roles) ? history.push("/home") : history.push("/")
          }
          aria-label="Home"
          color="inherit"
        >
          <HomeIcon />
        </IconButton>
      )}
    </AppBar>
  );
});

const mapStateToProps = state => ({
  organisation: state.app.organisation,
  authSession: state.app.authSession,
  organisations: state.app.organisations
});

export default withRouter(
  connect(
    mapStateToProps,
    { getUserInfo }
  )(AdminAppBar)
);
