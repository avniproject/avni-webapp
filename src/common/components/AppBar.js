import React from "react";
import LogoutButton from "../../adminApp/react-admin-config/LogoutButton";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Menu from "@material-ui/core/Menu";
import IconButton from "@material-ui/core/IconButton";
import UserIcon from "@material-ui/icons/AccountCircle";

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

export default props => {
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
      <AppBar position="fixed">
        <Toolbar className={classes.toolbar}>
          <div className={classes.title}>
            <Typography variant="h5" className={classes.titlet}>
              {props.title}
            </Typography>
          </div>
          <div className={classes.profile}>
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
      </AppBar>
    </div>
  );
};
