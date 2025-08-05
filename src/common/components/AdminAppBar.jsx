import { useCallback, useState } from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography
} from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import { Home as HomeIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import OrganisationOptions from "./OrganisationOptions";
import CurrentUserService from "../service/CurrentUserService.ts";
import LogoutButton from "../../adminApp/react-admin-config/LogoutButton";
import PasswordDialog from "../../adminApp/components/PasswordDialog";
import UserIcon from "@mui/icons-material/AccountCircle";
import { httpClient } from "../utils/httpClient";
import { get } from "lodash";
import {
  CommonAppBarStyles,
  StyledOrganisationInfo
} from "./CommonAppBarStyles";
import { SidebarToggleButton, useSidebarState } from "react-admin";

const StyledRoot = styled("div")(({ theme }) => ({
  flexGrow: 1
}));

const StyledAppBar = styled(MuiAppBar)(({ theme }) => ({
  position: "fixed",
  ...CommonAppBarStyles(theme).appBarContainer,
  backgroundColor: theme.palette.secondary.main
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

const StyledUserInfo = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  color: theme.palette.common.white
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.common.white,
  padding: theme.spacing(1)
}));

const StyledSidebarToggle = styled(SidebarToggleButton)(({ theme }) => ({
  position: "relative",
  marginLeft: "-30px"
}));

//alwaysOn should not be passed that is why it has been destructured
const AdminAppBar = ({
  component: CustomComponent = Box,
  alwaysOn,
  ...props
}) => {
  const navigate = useNavigate();

  const organisation = useSelector(state => state.app.organisation);
  const organisations = useSelector(state => state.app.organisations);
  const userInfo = useSelector(state => state.app.userInfo);
  const [open, toggleSidebar] = useSidebarState();

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

  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <StyledRoot>
      <StyledAppBar position="fixed" {...props}>
        <StyledToolbar>
          <StyledSidebarToggle onClick={toggleSidebar} />
          <StyledTitle variant="h6" id="react-admin-title" />

          <StyledUserSection>
            <OrganisationOptions
              organisation={organisation}
              organisations={organisations}
            />

            <StyledOrganisationInfo>
              <b>{organisation?.name}</b> ({userInfo?.username})
            </StyledOrganisationInfo>

            {CurrentUserService.hasOrganisationContext(userInfo) && (
              <StyledIconButton
                onClick={() => navigate("/home")}
                aria-label="Home"
                size="large"
              >
                <HomeIcon />
              </StyledIconButton>
            )}

            <StyledIconButton
              aria-label="refresh"
              onClick={handleRefresh}
              size="large"
            >
              <RefreshIcon />
            </StyledIconButton>

            <StyledUserInfo>
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
                open={Boolean(anchorEl)}
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
      <CustomComponent />
    </StyledRoot>
  );
};

export default AdminAppBar;
