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

const StyledAppBar = styled(MuiAppBar)(() => ({
  position: "fixed",
  ...CommonAppBarStyles.appBarContainer
}));

const StyledToolbarContainer = styled("div")(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minHeight: theme.spacing(6)
}));

const StyledOptions = styled("div")({
  flex: 1,
  display: "flex",
  flexDirection: "row",
  alignItems: "center"
});

const StyledTypography = styled(Typography)(({ theme }) => ({
  flex: 1,
  fontSize: theme.spacing(3),
  color: "white"
}));

const StyledProfile = styled("div")({
  flex: 1,
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center"
});

const StyledUserInfo = styled("div")({
  marginTop: "2%",
  color: "white"
});

const StyledMenuIconButton = styled(IconButton)({
  outline: "none",
  color: "white"
});

const StyledUserIconButton = styled(IconButton)({
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
        <Toolbar>
          <StyledToolbarContainer>
            <StyledOptions>
              {enableLeftMenuButton && (
                <StyledMenuIconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={handleDrawer}
                  edge="start"
                  size="large"
                >
                  <MenuIcon />
                </StyledMenuIconButton>
              )}
              <StyledTypography variant="h5">{title}</StyledTypography>
              <StyledProfile>
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
                <IconButton
                  onClick={() => navigate("/home")}
                  aria-label="Home"
                  color="inherit"
                  size="large"
                >
                  <HomeIcon />
                </IconButton>
                <StyledUserIconButton
                  aria-label="Profile"
                  aria-controls="long-menu"
                  aria-haspopup="true"
                  onClick={handleClick}
                  size="large"
                >
                  <UserIcon />
                </StyledUserIconButton>
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
              </StyledProfile>
            </StyledOptions>
            <CustomComponent />
          </StyledToolbarContainer>
        </Toolbar>
      </StyledAppBar>
    </StyledRoot>
  );
};

export default AppBar;
