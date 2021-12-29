import React from "react";
import LogoutButton from "../../adminApp/react-admin-config/LogoutButton";
import MuiAppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Menu from "@material-ui/core/Menu";
import IconButton from "@material-ui/core/IconButton";
import UserIcon from "@material-ui/icons/AccountCircle";
import MenuIcon from "@material-ui/icons/Menu";
import HomeIcon from "@material-ui/icons/Home";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { OrganisationOptions } from "./OrganisationOptions";
import { getUserInfo } from "../../rootApp/ducks";
import { Box } from "@material-ui/core";
import Link from "@material-ui/core/Link";
import Auth from "@aws-amplify/auth";
import { cognitoInDev, devEnvUserName, isDevEnv } from "../constants";
import { useTranslation } from "react-i18next";

const useStyle = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    marginBottom: theme.spacing(10)
  },
  bannerContainer: {
    display: "flex",
    height: "50px",
    backgroundColor: "#aacf4f",
    alignItems: "center",
    justifyContent: "center"
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

const onReviewBannerClick = async () => {
  const serverURL = isDevEnv ? "http://localhost:8021" : window.location.origin;
  let token = "";
  if (!isDevEnv || cognitoInDev) {
    const currentSession = await Auth.currentSession();
    token = `AUTH-TOKEN=${currentSession.idToken.jwtToken}`;
  } else {
    token = `user-name=${devEnvUserName}`;
  }
  window.open(`${serverURL}/userReview?${token}`, "_blank");
};

const AppBar = ({ getUserInfo, component, position, ...props }) => {
  const { t } = useTranslation();
  const { organisation, user, history, organisations } = props;
  const classes = useStyle();
  const [anchorEl, setAnchorEl] = React.useState(null);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  const CustomComponent = component ? component : Box;

  return (
    <div className={classes.root}>
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
                  user={user}
                  organisation={organisation}
                  styles={classes}
                  history={history}
                  organisations={organisations}
                />
                <div style={{ marginTop: "2%" }}>
                  <b>{props.organisation.name} </b> ({props.user.username})
                </div>
                <IconButton
                  onClick={() => props.history.push("/home")}
                  aria-label="Home"
                  color="inherit"
                >
                  <HomeIcon />
                </IconButton>
                <IconButton
                  aria-label="Profile"
                  aria-controls="long-menu"
                  aria-haspopup="true"
                  onClick={handleClick}
                >
                  <UserIcon className={classes.profileButton} />
                </IconButton>
                <Menu
                  id="long-menu"
                  anchorEl={anchorEl}
                  keepMounted
                  open={!!anchorEl}
                  onClose={handleClose}
                >
                  <LogoutButton />
                </Menu>
              </div>
            </div>
            <CustomComponent />
          </div>
        </Toolbar>
        {props.displayReviewBanner && (
          <div className={classes.bannerContainer}>
            <Link onClick={onReviewBannerClick} style={{ color: "#f1fbf8", fontSize: 20 }}>
              {t("reviewBannerText")}
            </Link>
          </div>
        )}
      </MuiAppBar>
    </div>
  );
};

const mapStateToProps = state => ({
  organisation: state.app.organisation,
  user: state.app.user,
  organisations: state.app.organisations
});

export default withRouter(
  connect(
    mapStateToProps,
    { getUserInfo }
  )(AppBar)
);
