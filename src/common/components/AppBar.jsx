import { useCallback, useState } from "react";
import { styled } from "@mui/material/styles";
import { Box, IconButton, Menu, Toolbar, Typography } from "@mui/material";
import LogoutButton from "../../adminApp/react-admin-config/LogoutButton";
import MuiAppBar from "@mui/material/AppBar";
import UserIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import OrganisationOptions from "./OrganisationOptions";
import { getUserInfo } from "../../rootApp/ducks";
import PasswordDialog from "../../adminApp/components/PasswordDialog";
import { httpClient } from "../utils/httpClient";
import { get } from "lodash";
import { CommonAppBarStyles } from "./CommonAppBarStyles";

const StyledRoot = styled("div")(({ theme }) => ({
  flexGrow: 1,
  marginBottom: theme.spacing(10)
}));

const StyledAppBar = styled(MuiAppBar)(({ theme }) => ({
  position: "fixed",
  backgroundColor: "#1976d2",
  ...CommonAppBarStyles.appBarContainer
}));

const StyledToolbar = styled(Toolbar)({
  ...CommonAppBarStyles.toolbar
});

const StyledTitle = styled(Typography)(({ theme }) => ({
  ...CommonAppBarStyles.title,
  fontSize: theme.spacing(3)
}));

const StyledUserSection = styled("div")({
  ...CommonAppBarStyles.userSection
});

const StyledUserInfo = styled("div")({
  marginRight: theme => theme.spacing(2),
  color: "white"
});

const StyledIconButton = styled(IconButton)({
  color: "white"
});

const AppBar = ({
  component: CustomComponent = Box,
  position,
  handleDrawer,
  enableLeftMenuButton,
  title
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const organisation = useSelector(state => state.app.organisation);
  const user = useSelector(state => state.app.authSession);
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

  const onSubmitNewPassword = useCallback(
    async password => {
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
    },
    [onClosePassword]
  );

  return (
    <StyledRoot>
      <PasswordDialog
        open={showChangePassword}
        username={user?.username}
        onClose={onClosePassword}
        onConfirm={onSubmitNewPassword}
        serverError={error}
      />
      <StyledAppBar position={position || "fixed"}>
        <StyledToolbar>
          {enableLeftMenuButton && (
            <StyledIconButton
              aria-label="open drawer"
              onClick={handleDrawer}
              edge="start"
              size="large"
            >
              <MenuIcon />
            </StyledIconButton>
          )}

          <StyledTitle variant="h5">{title}</StyledTitle>

          <StyledUserSection>
            <OrganisationOptions
              getUserInfo={() => dispatch(getUserInfo())}
              userInfo={userInfo}
              user={user}
              organisation={organisation}
              organisations={organisations}
            />
            <StyledUserInfo>
              <b>{organisation?.name}</b> ({user?.username})
            </StyledUserInfo>
            <StyledIconButton
              onClick={() => navigate("/home")}
              aria-label="Home"
              size="large"
            >
              <HomeIcon />
            </StyledIconButton>
            <StyledIconButton
              aria-label="Profile"
              aria-controls="long-menu"
              aria-haspopup="true"
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
                onChangePassword={() => setShowChangePassword(true)}
                lastSessionTimeMillis={userInfo?.lastSessionTime}
              />
            </Menu>
          </StyledUserSection>
        </StyledToolbar>
        <CustomComponent />
      </StyledAppBar>
    </StyledRoot>
  );
};

export default AppBar;
