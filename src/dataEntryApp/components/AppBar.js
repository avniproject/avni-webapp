import { useState, useEffect, useRef } from "react";
import { styled } from "@mui/material/styles";
import { AppBar, Toolbar, IconButton, Typography, MenuItem, Menu, Button, ClickAwayListener, Grow, Paper, Popper } from "@mui/material";
import { AccountCircle, MoreHoriz, ExpandMore, Home } from "@mui/icons-material";
import NewMenu from "../views/dashboardNew/NewMenu";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { InternalLink } from "common/components/utils";
import logo from "../../formDesigner/styles/images/avniLogo.png";
import UserOption from "./UserOption";
import { useTranslation } from "react-i18next";
import { getNews, selectIsNewsAvailable } from "../reducers/NewsReducer";

const StyledRoot = styled("div")({
  flexGrow: 1
});

const StyledAppBar = styled(AppBar)({
  background: "white"
});

const StyledTypography = styled(Typography)(({ theme }) => ({
  flexGrow: 1,
  display: "none",
  [theme.breakpoints.up("sm")]: {
    display: "block"
  }
}));

const StyledRegisterButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(3),
  color: "#0e6eff"
}));

const StyledLinkButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  marginRight: "10px",
  marginLeft: "2px",
  color: "white",
  background: "blue",
  padding: "2px",
  paddingLeft: "10px",
  paddingRight: "10px",
  borderRadius: "3px"
}));

const StyledUsers = styled("div")({
  marginRight: "3px"
});

const StyledUserName = styled("p")({
  fontSize: "15px",
  marginBottom: "0px",
  fontWeight: "600",
  color: "blue"
});

const StyledSectionDesktop = styled("div")(({ theme }) => ({
  display: "none",
  [theme.breakpoints.up("md")]: {
    display: "flex"
  }
}));

const StyledSectionMobile = styled("div")(({ theme }) => ({
  display: "flex",
  [theme.breakpoints.up("md")]: {
    display: "none"
  }
}));

const StyledUserOptionContainer = styled("div")(({ theme }) => ({
  width: "100%",
  color: "blue",
  maxWidth: 360,
  position: "absolute",
  zIndex: "2",
  backgroundColor: theme.palette.background.paper
}));

const StyledPopper = styled(Popper)({
  zIndex: 100
});

const PrimarySearchAppBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Use useSelector hooks instead of connect
  const user = useSelector(state => state.app.authSession);
  const isNewsAvailable = useSelector(selectIsNewsAvailable);

  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [userOption, setUserOption] = useState(false);

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  useEffect(() => {
    dispatch(getNews());
  }, [dispatch]);

  const handleProfileMenuOpen = () => {
    setUserOption(prev => !prev);
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

  const handleHomeClick = () => {
    navigate("/home");
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <ClickAwayListener onClickAway={handleClickAway}>
      <StyledUserOptionContainer>
        <UserOption />
      </StyledUserOptionContainer>
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
        <IconButton aria-label="account of current user" aria-controls="primary-search-account-menu" aria-haspopup="true" size="large">
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  const LinkButton = ({ link, label }) => (
    <StyledLinkButton variant="contained" component={Link} to={link}>
      {t(label)}
    </StyledLinkButton>
  );

  return (
    <StyledRoot>
      <StyledAppBar position="static">
        <Toolbar>
          <StyledTypography variant="h6" noWrap>
            <InternalLink to={"/app"}>
              <img src={logo} alt="logo" />
            </InternalLink>
          </StyledTypography>
          <ClickAwayListener onClickAway={newHandleclose}>
            <div>
              <StyledRegisterButton
                ref={anchorRef}
                aria-controls={open ? "menu-list-grow" : undefined}
                aria-haspopup="true"
                onClick={handleToggle}
              >
                {t("register")}
                <ExpandMore />
              </StyledRegisterButton>
              <StyledPopper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
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
              </StyledPopper>
            </div>
          </ClickAwayListener>
          <LinkButton label={"search"} link={"/app/searchFilter"} />
          {isNewsAvailable && <LinkButton label={"news"} link={"/app/news"} />}
          <StyledUsers>
            <Typography component="div" sx={{ color: "inherit" }}>
              <StyledUserName>{user.username}</StyledUserName>
            </Typography>
          </StyledUsers>
          <IconButton onClick={handleHomeClick} aria-label="Home" size="large">
            <Home />
          </IconButton>
          <StyledSectionDesktop>
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              size="large"
            >
              <AccountCircle />
            </IconButton>
          </StyledSectionDesktop>
          <StyledSectionMobile>
            <IconButton
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              size="large"
            >
              <MoreHoriz />
            </IconButton>
          </StyledSectionMobile>
        </Toolbar>
      </StyledAppBar>
      {renderMobileMenu}
      {userOption ? renderMenu : ""}
    </StyledRoot>
  );
};

export default PrimarySearchAppBar;
