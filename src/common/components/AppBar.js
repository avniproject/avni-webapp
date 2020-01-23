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
    display: "flex",
    minHeight: theme.spacing(6)
  },
  profile: {
    flex: 1,
    display: "flex",
    justifyContent: "flex-end"
  },
  profileButton: {
    color: "white"
  }
}));

const AppBar = props => {
  const classes = useStyle();
  const [anchorEl, setAnchorEl] = React.useState(null);
  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <div className={classes.root}>
      <MuiAppBar position="fixed">
        <Toolbar className={classes.toolbar}>
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
        </Toolbar>
      </MuiAppBar>
    </div>
  );
};

const mapStateToProps = state => ({
  organisation: state.app.organisation,
  user: state.app.user
});

export default withRouter(
  connect(
    mapStateToProps,
    null
  )(AppBar)
);
