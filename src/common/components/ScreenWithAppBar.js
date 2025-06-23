import React from "react";
import Body from "./Body";
import AppBar from "./AppBar";
import clsx from "clsx";
import { makeStyles } from "@mui/styles";
import { Drawer, List, IconButton, ListItemIcon, ListItemText } from "@mui/material";
import { useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import _ from "lodash";

import ListItemButton from "@mui/material/ListItemButton";

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  appBar: {
    paddingLeft: 70,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    paddingLeft: drawerWidth,
    width: `calc(100%)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  container: {
    margin: "0px 15px 0px 15px"
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

const applyLeftMenu = (classes, open, handleDrawer, selectedIndex, handleListItemClick, children, sidebarOptions) => {
  const history = useHistory();

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
          <IconButton onClick={handleDrawer} size="large" />
        </div>
        <List>
          {_.map(sidebarOptions, (option, index) => {
            const path = option.href.startsWith("#") ? option.href.replace("#", "") : option.href;
            return (
              <ListItemButton
                key={option.name}
                selected={selectedIndex === index}
                onClick={() => {
                  handleListItemClick(null, index);
                  history.push(`${path}?page=0`);
                }}
              >
                {applyListIcon(open, <option.Icon />, option.name)}
              </ListItemButton>
            );
          })}
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

const getSelectedListItem = sidebarOptions => {
  return _.isEmpty(sidebarOptions)
    ? 0
    : _.map(sidebarOptions, (option, i) => ({
        selected: window.location.href.includes(option.href.replace("#", "")),
        index: i
      })).filter(option => option.selected)[0]?.index || 0;
};

const ScreenWithAppBar = props => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);
  const [selectedIndex, setSelectedIndex] = React.useState(getSelectedListItem(props.sidebarOptions));

  function handleListItemClick(event, index) {
    setSelectedIndex(index);
  }

  function handleDrawer() {
    setOpen(!open);
  }

  return (
    <div className={classes.container}>
      <AppBar title={props.appbarTitle} handleDrawer={handleDrawer} enableLeftMenuButton={props.enableLeftMenuButton} />
      {props.enableLeftMenuButton &&
        applyLeftMenu(classes, open, handleDrawer, selectedIndex, handleListItemClick, props.children, props.sidebarOptions)}

      {!props.enableLeftMenuButton && <Body>{props.children}</Body>}
    </div>
  );
};

ScreenWithAppBar.propTypes = {
  appbarTitle: PropTypes.string.isRequired,
  enableLeftMenuButton: PropTypes.bool
};
ScreenWithAppBar.defaultProps = { enableLeftMenuButton: false };

export default ScreenWithAppBar;
