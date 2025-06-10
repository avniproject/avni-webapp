import React, { useCallback, useState } from "react";
import LogoutButton from "../../adminApp/react-admin-config/LogoutButton";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import Menu from "@mui/material/Menu";
import IconButton from "@mui/material/IconButton";
import UserIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { OrganisationOptions } from "./OrganisationOptions";
import { getUserInfo } from "../../rootApp/ducks";
import { Box } from "@mui/material";
import PasswordDialog from "../../adminApp/components/PasswordDialog";
import httpClient from "../utils/httpClient";
import { get } from "lodash";

const useStyle = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    marginBottom: theme.spacing(10)
  },
  title: {
    flex: 1,
    fontSize: theme.spacing(3)
  },
  titlet: {
    flex: 1
  },
  toolbar: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: theme.spacing(6)
  },
  options: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  profile: {
    flex: 1,
    display: "flex",
    justifyContent: "flex-end"
  },
  profileButton: {
    color: "white"
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    color: "white"
  }
}));

const AppBar = ({ getUserInfo, component, position, userInfo, ...props }) => {
  const { organisation, user, history, organisations } = props;
  const classes = useStyle();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [error, setError] = useState(null);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  const onClosePassword = useCallback(() => {
    setShowChangePassword(false);
    handleClose();
  }, []);

  const onSubmitNewPassword = useCallback(async password => {
    try {
      await httpClient.putJson("/user/changePassword", { newPassword: password });
      onClosePassword();
    } catch (e) {
      setError(get(e, "response.data.message", "Unknown error. Could not change password"));
    }
  }, []);

  const CustomComponent = component ? component : Box;

  return (
    <div className={classes.root}>
      <PasswordDialog
        open={showChangePassword}
        username={user.username}
        onClose={() => onClosePassword()}
        onConfirm={password => onSubmitNewPassword(password)}
        serverError={error}
      />
      <MuiAppBar position={position || "fixed"}>
        <Toolbar>
          <div className={classes.toolbar}>
            <div className={classes.options}>
              {props.enableLeftMenuButton && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={props.handleDrawer}
                  edge="start"
                  style={{ outline: "none" }}
                  size="large"
                >
                  <MenuIcon />
                </IconButton>
              )}
              <div className={classes.title}>
                <Typography variant="h5" className={classes.titlet}>
                  {props.title}
                </Typography>
              </div>
              <div className={classes.profile}>
                <OrganisationOptions
                  getUserInfo={getUserInfo}
                  userInfo={userInfo}
                  user={user}
                  organisation={organisation}
                  styles={classes}
                  history={history}
                  organisations={organisations}
                />
                <div style={{ marginTop: "2%" }}>
                  <b>{props.organisation.name} </b> ({props.user.username})
                </div>
                <IconButton onClick={() => history.push("/home")} aria-label="Home" color="inherit" size="large">
                  <HomeIcon />
                </IconButton>
                <IconButton aria-label="Profile" aria-controls="long-menu" aria-haspopup="true" onClick={handleClick} size="large">
                  <UserIcon className={classes.profileButton} />
                </IconButton>
                <Menu id="long-menu" anchorEl={anchorEl} keepMounted open={!!anchorEl} onClose={handleClose}>
                  <LogoutButton onChangePassword={() => setShowChangePassword(true)} lastSessionTimeMillis={userInfo.lastSessionTime} />
                </Menu>
              </div>
            </div>
            <CustomComponent />
          </div>
        </Toolbar>
      </MuiAppBar>
    </div>
  );
};

const mapStateToProps = state => ({
  organisation: state.app.organisation,
  user: state.app.authSession,
  organisations: state.app.organisations,
  userInfo: state.app.userInfo
});

export default withRouter(
  connect(
    mapStateToProps,
    { getUserInfo }
  )(AppBar)
);
