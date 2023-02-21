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
import { Link, withRouter } from "react-router-dom";
import { connect, useDispatch, useSelector } from "react-redux";
import { InternalLink, withParams } from "common/components/utils";
import logo from "../../formDesigner/styles/images/avniLogo.png";
import UserOption from "./UserOption";
import { useTranslation } from "react-i18next";
import HomeIcon from "@material-ui/icons/Home";
import { getNews, selectIsNewsAvailable } from "../reducers/NewsReducer";
import { ROLES } from "../../common/constants";
import { intersection, isEmpty } from "lodash";

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
  userName: {
    fontSize: "15px",
    marginBottom: "0px",
    fontWeight: "600px",
    color: "blue"
  },
  userDesignation: {
    fontSize: "12px",
    marginRight: "6px",
    marginBottom: "0px",
    color: "grey"
  },
  users: {
    marginRight: "3px"
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
  },
  button: {
    margin: theme.spacing(1)
  }
}));

const PrimarySearchAppBar = ({ user, history }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const [userOption, setUserOption] = React.useState(false);

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };
  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  useEffect(() => {
    dispatch(getNews());
  }, []);

  const isNewsAvailable = useSelector(selectIsNewsAvailable);

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

  const newHandleclose = () => {
    setOpen(false);
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div>
        <UserOption history={history} />
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

  const LinkButton = ({ link, label }) => (
    <Button
      variant="contained"
      className={classes.button}
      component={Link}
      to={link}
      style={{
        marginRight: "10px",
        marginLeft: "2px",
        color: "white",
        background: "blue",
        padding: "2px",
        paddingLeft: "10px",
        paddingRight: "10px",
        borderRadius: "3px"
      }}
    >
      {t(label)}
    </Button>
  );

  const displayHomeButton = !isEmpty(intersection([ROLES.ADMIN, ROLES.ORG_ADMIN], user.roles));

  return (
    <div className={classes.grow}>
      <AppBar position="static" style={{ background: "white" }}>
        <Toolbar>
          <Typography className={classes.title} variant="h6" noWrap>
            <InternalLink to={"/app"}>
              <img src={logo} alt="logo" />
            </InternalLink>
          </Typography>

          {
            <ClickAwayListener onClickAway={newHandleclose}>
              <div>
                <Button
                  className={classes.headerMenu}
                  ref={anchorRef}
                  aria-controls={open ? "menu-list-grow" : undefined}
                  aria-haspopup="true"
                  onClick={handleToggle}
                  style={{ color: "#0e6eff" }}
                >
                  {t("register")}
                  <ExpandMoreIcon />
                </Button>
                <Popper
                  style={{ zIndex: 100 }}
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
                        <NewMenu handleClose={newHandleclose} />
                      </Paper>
                    </Grow>
                  )}
                </Popper>
              </div>
            </ClickAwayListener>
          }

          <LinkButton label={"search"} link={"/app/searchFilter"} />
          {isNewsAvailable && <LinkButton label={"news"} link={"/app/news"} />}
          <div className={classes.users}>
            <Typography component={"div"} color="inherit">
              <p className={classes.userName}>{user.username}</p>
              {/* <p className={classes.userDesignation}>{user.roles[0]}</p> */}
            </Typography>
          </div>
          {displayHomeButton && (
            <IconButton onClick={() => history.push("/home")} aria-label="Home">
              <HomeIcon />
            </IconButton>
          )}
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

const mapStateToProps = state => ({
  user: state.app.user
});

export default withRouter(withParams(connect(mapStateToProps)(PrimarySearchAppBar)));
