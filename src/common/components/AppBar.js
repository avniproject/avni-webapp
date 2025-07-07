import { useCallback, useState } from "react";
import { styled } from "@mui/material/styles";
import LogoutButton from "../../adminApp/react-admin-config/LogoutButton";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import IconButton from "@mui/material/IconButton";
import UserIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { OrganisationOptions } from "./OrganisationOptions";
import { getUserInfo } from "../../rootApp/ducks";
import { Box } from "@mui/material";
import PasswordDialog from "../../adminApp/components/PasswordDialog";
import { httpClient } from "../utils/httpClient";
import { get } from "lodash";

const StyledRoot = styled("div")(({ theme }) => ({
  flexGrow: 1,
  marginBottom: theme.spacing(10)
}));

const StyledAppBar = styled(MuiAppBar)({
  position: "fixed"
});

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
  fontSize: theme.spacing(3)
}));

const StyledProfile = styled("div")({
  flex: 1,
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center"
});

const StyledUserInfo = styled("div")({
  marginTop: "2%"
});

const StyledMenuIconButton = styled(IconButton)({
  outline: "none"
});

const StyledUserIconButton = styled(IconButton)({
  color: "white"
});

const AppBar = ({
  getUserInfo,
  component,
  position,
  userInfo,
  organisation,
  user,
  history,
  organisations,
  handleDrawer,
  enableLeftMenuButton,
  title
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [error, setError] = useState(null);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  const onClosePassword = useCallback(() => {
    setShowChangePassword(false);
    handleClose();
  }, []);

  const onSubmitNewPassword = useCallback(async password => {
    try {
      await httpClient.putJson("/user/changePassword", { newPassword: password });
      onClosePassword();
    } catch (e) {
      setError(get(e, "response.data.message", "Unknown error. Could not change password"));
    }
  }, []);

  const CustomComponent = component ? component : Box;

  return (
    <StyledRoot>
      <PasswordDialog
        open={showChangePassword}
        username={user.username}
        onClose={() => onClosePassword()}
        onConfirm={password => onSubmitNewPassword(password)}
        serverError={error}
      />
      <StyledAppBar position={position || "fixed"}>
        <Toolbar>
          <StyledToolbarContainer>
            <StyledOptions>
              {enableLeftMenuButton && (
                <StyledMenuIconButton color="inherit" aria-label="open drawer" onClick={handleDrawer} edge="start" size="large">
                  <MenuIcon />
                </StyledMenuIconButton>
              )}
              <StyledTypography variant="h5">{title}</StyledTypography>
              <StyledProfile>
                <OrganisationOptions
                  getUserInfo={getUserInfo}
                  userInfo={userInfo}
                  user={user}
                  organisation={organisation}
                  history={history}
                  organisations={organisations}
                />
                <StyledUserInfo>
                  <b>{organisation.name} </b> ({user.username})
                </StyledUserInfo>
                <IconButton onClick={() => history.push("/home")} aria-label="Home" color="inherit" size="large">
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
                <Menu id="long-menu" anchorEl={anchorEl} keepMounted open={!!anchorEl} onClose={handleClose}>
                  <LogoutButton onChangePassword={() => setShowChangePassword(true)} lastSessionTimeMillis={userInfo.lastSessionTime} />
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

const mapStateToProps = state => ({
  organisation: state.app.organisation,
  user: state.app.authSession,
  organisations: state.app.organisations,
  userInfo: state.app.userInfo
});

export default withRouter(
  connect(
    mapStateToProps,
    { getUserInfo }
  )(AppBar)
);
