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
  const { organisation, user, history, staticContext, dispatch, organisations, ...rest } = props;

  return (
    <AppBar {...rest}>
      <Typography variant="h6" color="inherit" className={classes.title} id="react-admin-title" />
      <OrganisationOptions
        getUserInfo={getUserInfo}
        user={user}
        organisation={organisation}
        styles={styles}
        history={history}
        organisations={organisations}
      />
      <div>
        <b>{organisation.name} </b> ({user.username})
      </div>
      {(isEmpty(intersection(user.roles, [ROLES.ADMIN])) || !isEmpty(http.getOrgUUID())) && (
        <IconButton onClick={() => history.push("/home")} aria-label="Home" color="inherit">
          <HomeIcon />
        </IconButton>
      )}
    </AppBar>
  );
});

const mapStateToProps = state => ({
  organisation: state.app.organisation,
  user: state.app.user,
  organisations: state.app.organisations
});

export default withRouter(
  connect(
    mapStateToProps,
    { getUserInfo }
  )(AdminAppBar)
);
