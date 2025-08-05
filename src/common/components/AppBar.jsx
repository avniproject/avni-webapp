import { useCallback, useState } from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  Button,
  IconButton,
  Menu,
  Toolbar,
  Typography
} from "@mui/material";
import LogoutButton from "../../adminApp/react-admin-config/LogoutButton";
import MuiAppBar from "@mui/material/AppBar";
import UserIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import OrganisationOptions from "./OrganisationOptions";
import PasswordDialog from "../../adminApp/components/PasswordDialog";
import { httpClient } from "../utils/httpClient";
import { get } from "lodash";
import {
  CommonAppBarStyles,
  StyledOrganisationInfo
} from "./CommonAppBarStyles";

const StyledRoot = styled("div")(({ theme }) => ({
  flexGrow: 1,
  marginBottom: theme.spacing(10)
}));

const StyledAppBar = styled(MuiAppBar)(({ theme }) => ({
  position: "fixed",
  ...CommonAppBarStyles(theme).appBarContainer
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  ...CommonAppBarStyles(theme).toolbar
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
  ...CommonAppBarStyles(theme).title,
  flexGrow: 1
}));

const StyledUserSection = styled("div")(({ theme }) => ({
  ...CommonAppBarStyles(theme).userSection,
  "& > *:not(:first-of-type)": {
    marginLeft: theme.spacing(2)
  }
}));

const StyledUserInfo = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  color: theme.palette.common.white
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.common.white,
  padding: theme.spacing(1)
}));

const StyledHomeButton = styled(Button)(({ theme }) => ({
  color: theme.palette.common.white,
  minWidth: "auto",
  padding: theme.spacing(1, 1.5),
  "& .MuiButton-startIcon": {
    marginRight: 0,
    "& > svg": {
      fontSize: "1.5rem"
    }
  },
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)"
  }
}));

const AppBar = ({ position, handleDrawer, enableLeftMenuButton, title }) => {
  const navigate = useNavigate();

  const organisation = useSelector(state => state.app.organisation);
  const organisations = useSelector(state => state.app.organisations);
  const userInfo = useSelector(state => state.app.userInfo);

  const [anchorEl, setAnchorEl] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = event => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const onClosePassword = useCallback(() => {
    setShowChangePassword(false);
    handleClose();
  }, []);

  const onSubmitNewPassword = useCallback(async password => {
    try {
      await httpClient.putJson("/user/changePassword", {
        newPassword: password
      });
      onClosePassword();
    } catch (e) {
      setError(
        get(
          e,
          "response.data.message",
          "Unknown error. Could not change password"
        )
      );
    }
  }, []);

  return (
    <StyledRoot>
      <StyledAppBar position={position || "fixed"}>
        <StyledToolbar>
          {enableLeftMenuButton && (
            <StyledIconButton edge="start" onClick={handleDrawer} size="large">
              <MenuIcon />
            </StyledIconButton>
          )}
          <StyledTitle variant="h6">{title}</StyledTitle>

          <StyledUserSection>
            {organisation && (
              <OrganisationOptions
                organisation={organisation}
                organisations={organisations}
              />
            )}

            <StyledOrganisationInfo>
              <b>{organisation?.name}</b> ({userInfo?.username})
            </StyledOrganisationInfo>

            <StyledUserInfo>
              <StyledHomeButton
                onClick={() => navigate("/home")}
                startIcon={<HomeIcon />}
                aria-label="Navigate to home"
              />

              <StyledIconButton
                aria-label="account of current user"
                onClick={handleClick}
                size="large"
              >
                <UserIcon />
              </StyledIconButton>
              <Menu
                id="long-menu"
                anchorEl={anchorEl}
                keepMounted
                open={!!anchorEl}
                onClose={handleClose}
              >
                <LogoutButton
                  username={userInfo?.username}
                  lastSessionTimeMillis={userInfo?.lastSessionTime}
                  onChangePassword={() => setShowChangePassword(true)}
                />
              </Menu>
            </StyledUserInfo>
          </StyledUserSection>
        </StyledToolbar>
      </StyledAppBar>
      <PasswordDialog
        open={showChangePassword}
        username={userInfo?.username}
        onClose={() => onClosePassword()}
        onConfirm={password => onSubmitNewPassword(password)}
        serverError={error}
      />
    </StyledRoot>
  );
};

export default AppBar;
