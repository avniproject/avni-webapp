import { useState, useEffect, useRef } from "react";
import { styled, useTheme } from "@mui/material/styles";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  MenuItem,
  Menu,
  Button,
  ClickAwayListener,
  Grow,
  Paper,
  Popper,
  Box
} from "@mui/material";
import {
  AccountCircle,
  MoreHoriz,
  ExpandMore,
  Home
} from "@mui/icons-material";
import NewMenu from "../views/dashboardNew/NewMenu";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { InternalLink } from "common/components/utils";
import logo from "../../formDesigner/styles/images/avniLogo.png";
import UserOption from "./UserOption";
import { useTranslation } from "react-i18next";
import { getNews, selectIsNewsAvailable } from "../reducers/NewsReducer";
import { CommonAppBarStyles } from "../../common/components/CommonAppBarStyles";

const StyledRoot = styled("div")(({ theme }) => ({
  flexGrow: 1
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  ...CommonAppBarStyles(theme).appBarContainer,
  boxShadow: "0 0.125rem 0.75rem rgba(0,0,0,0.15)"
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  ...CommonAppBarStyles(theme).toolbar,
  padding: theme.spacing(0, 2),
  minHeight: "4rem !important"
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
  ...CommonAppBarStyles(theme).title,
  flexGrow: 1,
  minWidth: 0,
  [theme.breakpoints.up("sm")]: {
    display: "block"
  }
}));

// Enhanced logo container with white background and subtle styling
const StyledLogoContainer = styled(Box)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "white",
  borderRadius: "0.5rem",
  padding: "0.375rem 0.5rem",
  boxShadow: "0 0.125rem 0.5rem rgba(0,0,0,0.1)",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 0.25rem 1rem rgba(0,0,0,0.15)",
    transform: "translateY(-0.0625rem)"
  },
  "& img": {
    height: "2rem",
    width: "auto",
    display: "block"
  }
}));

const StyledRegisterButton = styled(Button)(({ theme }) => ({
  marginRight: "0.625rem",
  color: "white",
  borderColor: "white",
  borderRadius: "0.5rem",
  fontWeight: 500,
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: "rgba(255, 255, 255, 0.9)",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    transform: "translateY(-0.0625rem)",
    boxShadow: "0 0.25rem 0.75rem rgba(0,0,0,0.2)"
  }
}));

const StyledLinkButton = styled(Button)(({ theme }) => ({
  marginRight: "0.625rem",
  color: "white",
  borderColor: "white",
  borderRadius: "0.5rem",
  fontWeight: 500,
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "rgba(255, 255, 255, 0.4)",
    transform: "translateY(-0.0625rem)",
    boxShadow: "0 0.25rem 0.75rem rgba(0,0,0,0.15)",
    color: "white"
  }
}));

const StyledUserSection = styled("div")(({ theme }) => ({
  ...CommonAppBarStyles(theme).userSection,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2)
}));

const StyledUserName = styled("p")({
  fontSize: "0.9375rem",
  marginBottom: "0rem",
  fontWeight: "600",
  color: "white",
  textShadow: "0 0.0625rem 0.125rem rgba(0,0,0,0.1)"
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

const StyledPopper = styled(Popper)({
  zIndex: 100
});

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.common.white,
  padding: theme.spacing(1),
  borderRadius: "0.5rem",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    transform: "translateY(-0.0625rem)",
    boxShadow: "0 0.25rem 0.75rem rgba(0,0,0,0.1)"
  }
}));

// Enhanced Paper component for dropdown menus
const StyledDropdownPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "0.75rem",
  boxShadow: "0 0.5rem 2rem rgba(0,0,0,0.15)",
  overflow: "hidden",
  border: "0.0625rem solid rgba(0,0,0,0.08)"
}));

const PrimarySearchAppBar = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const userInfo = useSelector(state => state.app.userInfo);
  const isNewsAvailable = useSelector(selectIsNewsAvailable);

  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const isProfileMenuOpen = Boolean(profileAnchorEl);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

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

  const handleProfileMenuOpen = event => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMobileMenuOpen = event => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const newHandleclose = () => {
    setOpen(false);
  };

  const handleHomeClick = () => {
    navigate("/home");
  };

  const menuId = "primary-search-account-menu";

  const renderMenu = (
    <Menu
      open={isProfileMenuOpen}
      anchorEl={profileAnchorEl}
      onClose={handleProfileMenuClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      disableScrollLock
      disableAutoFocusItem
      slotProps={{
        paper: {
          sx: {
            overflow: "visible",
            boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.15)",
            backgroundColor: theme.palette.secondary.main,
            borderRadius: 300,
            minWidth: "22rem",
            mt: 1.5
          }
        },
        list: {
          disablePadding: true,
          sx: {
            overflow: "visible",
            p: 0
          }
        }
      }}
    >
      {isProfileMenuOpen && (
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <UserOption />
        </Box>
      )}
    </Menu>
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
      PaperProps={{
        sx: {
          borderRadius: "0.75rem",
          boxShadow: "0 0.5rem 2rem rgba(0,0,0,0.15)",
          mt: 1
        }
      }}
    >
      <MenuItem
        onClick={event => {
          handleMobileMenuClose();
          handleProfileMenuOpen(event);
        }}
        sx={{
          borderRadius: "0.5rem",
          margin: "0.25rem",
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.04)"
          }
        }}
      >
        <IconButton
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          size="large"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  const LinkButton = ({ link, label }) => (
    <StyledLinkButton variant="outlined" component={Link} to={link}>
      {t(label)}
    </StyledLinkButton>
  );

  return (
    <StyledRoot>
      <StyledAppBar position="static">
        <StyledToolbar>
          <StyledTitle variant="h6" noWrap>
            <InternalLink to={"/app"}>
              <StyledLogoContainer>
                <img src={logo} alt="logo" />
              </StyledLogoContainer>
            </InternalLink>
          </StyledTitle>

          <ClickAwayListener onClickAway={newHandleclose}>
            <div>
              <StyledRegisterButton
                ref={anchorRef}
                variant="outlined"
                aria-controls={open ? "menu-list-grow" : undefined}
                aria-haspopup="true"
                onClick={handleToggle}
              >
                {t("register")}
                <ExpandMore />
              </StyledRegisterButton>
              <StyledPopper
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
                      transformOrigin:
                        placement === "bottom" ? "center top" : "center bottom"
                    }}
                  >
                    <StyledDropdownPaper>
                      <NewMenu handleClose={newHandleclose} />
                    </StyledDropdownPaper>
                  </Grow>
                )}
              </StyledPopper>
            </div>
          </ClickAwayListener>

          <LinkButton label={"search"} link={"/app/searchFilter"} />
          {isNewsAvailable && <LinkButton label={"news"} link={"/app/news"} />}

          <StyledUserSection>
            <Typography component="div" sx={{ color: "inherit" }}>
              <StyledUserName>{userInfo.username}</StyledUserName>
            </Typography>
            <StyledIconButton
              onClick={handleHomeClick}
              aria-label="Home"
              size="large"
            >
              <Home />
            </StyledIconButton>
            <StyledSectionDesktop>
              <StyledIconButton
                edge="end"
                aria-label="account of current user"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                size="large"
              >
                <AccountCircle />
              </StyledIconButton>
            </StyledSectionDesktop>
            <StyledSectionMobile>
              <StyledIconButton
                aria-label="show more"
                aria-controls={mobileMenuId}
                aria-haspopup="true"
                onClick={handleMobileMenuOpen}
                size="large"
              >
                <MoreHoriz />
              </StyledIconButton>
            </StyledSectionMobile>
          </StyledUserSection>
        </StyledToolbar>
      </StyledAppBar>
      {renderMobileMenu}
      {renderMenu}
    </StyledRoot>
  );
};

export default PrimarySearchAppBar;
