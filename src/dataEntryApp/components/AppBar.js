import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import AccountCircle from "@material-ui/icons/AccountCircle";
import MoreIcon from "@material-ui/icons/MoreVert";
import Button from "@material-ui/core/Button";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import Popper from "@material-ui/core/Popper";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import NewMenu from "../views/dashboardNew/NewMenu";
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import logo from "../../formDesigner/styles/images/avniLogo.png";
import UserOption from "./UserOption";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    flexGrow: 1,
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block"
    }
  },
  sectionDesktop: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "flex"
    }
  },
  root: {
    width: "100%",
    color: "blue",
    maxWidth: 360,
    position: "absolute",
    zIndex: "2",
    backgroundColor: theme.palette.background.paper
  },
  MuiSvgIcon: {
    root: {
      color: "blue"
    }
  },
  nested: {
    paddingLeft: theme.spacing(4)
  },
  sectionMobile: {
    display: "flex",
    [theme.breakpoints.up("md")]: {
      display: "none"
    }
  },
  inputSearch: {
    borderBottom: "1px solid #dcdcdc",
    color: "#0e6eff",
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(1),
      width: "715px"
    }
  },
  headerMenu: {
    marginLeft: theme.spacing(3)
  },
  ListItemText: {
    color: "blue"
  }
}));

const PrimarySearchAppBar = ({
  getOrgConfigInfo,
  getUserInfo,
  orgConfig,
  defaultLanguage,
  userInfo
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const [userOption, setUserOption] = React.useState(false);

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  const handleProfileMenuOpen = event => {
    userOption ? setUserOption(false) : setUserOption(true);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMobileMenuOpen = event => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleClickAway = () => {
    setUserOption(false);
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div>
        <UserOption />
      </div>
    </ClickAwayListener>
  );

  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  return (
    <div className={classes.grow}>
      <AppBar position="static" style={{ background: "white" }}>
        <Toolbar>
          <Typography className={classes.title} variant="h6" noWrap>
            <img src={logo} alt="logo" />
          </Typography>
          <form noValidate autoComplete="off">
            <Input
              className={classes.inputSearch}
              placeholder={t("search")}
              id="standard-adornment-search"
              endAdornment={
                <InputAdornment position="end">
                  <ExpandMoreIcon />
                </InputAdornment>
              }
              aria-describedby="standard-weight-helper-text"
              inputProps={{
                "aria-label": "search"
              }}
            />
          </form>
          <div>
            <Button
              className={classes.headerMenu}
              ref={anchorRef}
              aria-controls={open ? "menu-list-grow" : undefined}
              aria-haspopup="true"
              onClick={handleToggle}
              style={{ color: "#0e6eff" }}
            >
              {t("new")}
              <ExpandMoreIcon />
            </Button>
            <Popper
              open={open}
              anchorEl={anchorRef.current}
              role={undefined}
              transition
              disablePortal
            >
              {({ TransitionProps, placement }) => (
                <Grow
                  {...TransitionProps}
                  style={{
                    transformOrigin: placement === "bottom" ? "center top" : "center bottom"
                  }}
                >
                  <Paper>
                    <ClickAwayListener onClickAway={handleClose}>
                      <NewMenu />
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
          </div>
          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
            >
              <AccountCircle />
            </IconButton>
          </div>
          <div className={classes.sectionMobile}>
            <IconButton
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
            >
              <MoreIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {userOption ? renderMenu : ""}
    </div>
  );
};

export default withRouter(
  withParams(
    connect(
      null,
      null
    )(PrimarySearchAppBar)
  )
);
