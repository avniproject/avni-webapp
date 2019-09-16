import React from "react";
import Body from "./Body";
import AppBar from "./AppBar";
import { Container } from "@material-ui/core";
import HomeIcon from "@material-ui/icons/Home";
import ListAltIcon from "@material-ui/icons/ListAlt";
import DescriptionIcon from "@material-ui/icons/Description";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";

import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import PropTypes from "prop-types";

/**
 * This is the typical view you will need for most of your screens.
 * It gives your basic screen with an app bar and a white background for your content.
 *
 * @param props
 * @returns {*}
 * @constructor
 */

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  appBar: {
    marginLeft: 60,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },

  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    zIndex: 1
  },
  drawerOpen: {
    zIndex: 1,
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerClose: {
    zIndex: 1,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    overflowX: "hidden",
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9) + 1
    }
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar
  }
}));

const applyListIcon = (open, icon, listTextName) => {
  if (!open) {
    return <ListItemIcon>{icon}</ListItemIcon>;
  } else {
    return (
      <>
        {icon}
        <ListItemText primary={listTextName} />
      </>
    );
  }
};

const applyLeftMenu = (
  classes,
  open,
  handleDrawer,
  selectedIndex,
  handleListItemClick,
  children
) => {
  return (
    <>
      <Drawer
        variant="permanent"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open
          })
        }}
        open={open}
      >
        <div className={classes.toolbar}>
          <IconButton onClick={handleDrawer} />
        </div>

        <List>
          <ListItem
            button
            component="a"
            href="/#/"
            key="Homepage"
            selected={selectedIndex === 0}
            onClick={event => handleListItemClick(event, 0)}
          >
            {applyListIcon(open, <HomeIcon />, "Home")}
          </ListItem>
          <Divider />
          <ListItem
            button
            component="a"
            href="/#/forms"
            key="Forms"
            selected={selectedIndex === 1}
            onClick={event => handleListItemClick(event, 1)}
          >
            {applyListIcon(open, <DescriptionIcon />, "Forms")}
          </ListItem>
          <Divider />
          <ListItem
            button
            component="a"
            href="/#/concepts"
            key="Concepts"
            selected={selectedIndex === 2}
            onClick={event => handleListItemClick(event, 2)}
          >
            {applyListIcon(open, <ListAltIcon />, "Concepts")}
          </ListItem>
          <Divider />
          <ListItem
            button
            component="a"
            href="/#/upload"
            key="Upload"
            selected={selectedIndex === 3}
            onClick={event => handleListItemClick(event, 3)}
          >
            {applyListIcon(open, <ListAltIcon />, "Upload/Download Data")}
          </ListItem>
        </List>
      </Drawer>
      <main
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open
        })}
      >
        <Body>{children}</Body>
      </main>
    </>
  );
};

const ScreenWithAppBar = props => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);
  const selectedListItem = window.location.href.includes("/#/forms") === true ? 1 : 2;
  const [selectedIndex, setSelectedIndex] = React.useState(selectedListItem);
  function handleListItemClick(event, index) {
    setSelectedIndex(index);
  }
  function handleDrawer() {
    setOpen(!open);
  }

  return (
    <Container fixed>
      <AppBar
        title={props.appbarTitle}
        handleDrawer={handleDrawer}
        enableLeftMenuButton={props.enableLeftMenuButton}
      />
      {props.enableLeftMenuButton &&
        applyLeftMenu(
          classes,
          open,
          handleDrawer,
          selectedIndex,
          handleListItemClick,
          props.children
        )}

      {!props.enableLeftMenuButton && <Body>{props.children}</Body>}
    </Container>
  );
};

ScreenWithAppBar.propTypes = {
  appbarTitle: PropTypes.string.isRequired,
  enableLeftMenuButton: PropTypes.bool
};
ScreenWithAppBar.defaultProps = { enableLeftMenuButton: false };

export default ScreenWithAppBar;
