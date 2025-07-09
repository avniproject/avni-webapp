import { useState } from "react";
import { styled } from "@mui/material/styles";
import Body from "./Body";
import AppBar from "./AppBar";
import { Drawer, List, IconButton, ListItemIcon, ListItemText } from "@mui/material";
import { useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import _ from "lodash";
import ListItemButton from "@mui/material/ListItemButton";

const drawerWidth = 240;

const StyledContainer = styled("div")({
  margin: 0,
  display: "flex",
  flexDirection: "column",
  width: "100%",
  boxSizing: "border-box"
});

const StyledAppBar = styled("main")(({ theme, open }) => {
  const minimizedWidth = parseInt(theme.spacing(7)) + 1;
  const minimizedWidthSm = parseInt(theme.spacing(9)) + 1;
  return {
    marginLeft: open ? drawerWidth + 10 : minimizedWidth + 10,
    width: open ? `calc(100% - ${drawerWidth}px)` : `calc(100% - ${minimizedWidth}px)`,
    boxSizing: "border-box",
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: open ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen
    }),
    [theme.breakpoints.up("sm")]: {
      marginLeft: open ? drawerWidth + 10 : minimizedWidthSm + 10,
      width: open ? `calc(100% - ${drawerWidth}px)` : `calc(100% - ${minimizedWidthSm}px)`
    }
  };
});

const StyledDrawer = styled(Drawer)(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  zIndex: theme.zIndex.appBar - 1,
  "& .MuiDrawer-paper": {
    width: open ? drawerWidth : parseInt(theme.spacing(7)) + 1,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: open ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen
    }),
    overflowX: "hidden",
    [theme.breakpoints.up("sm")]: {
      width: open ? drawerWidth : parseInt(theme.spacing(9)) + 1
    }
  }
}));

const StyledToolbar = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: "0 8px",
  ...theme.mixins.toolbar
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

const applyLeftMenu = (open, handleDrawer, selectedIndex, handleListItemClick, children, sidebarOptions) => {
  const history = useHistory();

  return (
    <>
      <StyledDrawer variant="permanent" open={open}>
        <StyledToolbar>
          <IconButton onClick={handleDrawer} size="large" />
        </StyledToolbar>
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
      </StyledDrawer>
      <StyledAppBar open={open}>
        <Body>{children}</Body>
      </StyledAppBar>
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
  const [open, setOpen] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(getSelectedListItem(props.sidebarOptions));

  function handleListItemClick(event, index) {
    setSelectedIndex(index);
  }

  function handleDrawer() {
    setOpen(!open);
  }

  return (
    <StyledContainer>
      <AppBar
        title={props.appbarTitle}
        handleDrawer={handleDrawer}
        enableLeftMenuButton={props.enableLeftMenuButton}
        sx={{ zIndex: theme => theme.zIndex.appBar }}
      />
      {props.enableLeftMenuButton &&
        applyLeftMenu(open, handleDrawer, selectedIndex, handleListItemClick, props.children, props.sidebarOptions)}
      {!props.enableLeftMenuButton && <Body>{props.children}</Body>}
    </StyledContainer>
  );
};

ScreenWithAppBar.propTypes = {
  appbarTitle: PropTypes.string.isRequired,
  enableLeftMenuButton: PropTypes.bool
};
ScreenWithAppBar.defaultProps = { enableLeftMenuButton: false };

export default ScreenWithAppBar;
