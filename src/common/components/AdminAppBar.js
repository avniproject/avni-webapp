import { AppBar, useLogout } from "react-admin";
import { Typography, IconButton, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Home, ExitToApp } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { OrganisationOptions } from "./OrganisationOptions";
import { getUserInfo } from "../../rootApp/ducks";
import CurrentUserService from "../service/CurrentUserService";

const StyledAppBar = styled(AppBar)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "0 1em"
});

const StyledTypography = styled(Typography)({
  flex: 1,
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  overflow: "hidden"
});

const AdminAppBar = props => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const organisation = useSelector(state => state.app.organisation);
  const authSession = useSelector(state => state.app.authSession);
  const organisations = useSelector(state => state.app.organisations);
  const userInfo = useSelector(state => state.app.userInfo);
  const logout = useLogout();

  return (
    <StyledAppBar {...props}>
      <StyledTypography variant="h6" sx={{ color: "inherit" }} id="react-admin-title" />
      <OrganisationOptions
        getUserInfo={() => dispatch(getUserInfo())}
        user={authSession}
        userInfo={userInfo}
        organisation={organisation}
        organisations={organisations}
      />
      <Box sx={{ mx: 2 }}>
        <b>{organisation?.name}</b> ({authSession?.username})
      </Box>
      {CurrentUserService.hasOrganisationContext(userInfo) && (
        <Box>
          <IconButton onClick={() => navigate("/home")} aria-label="Home" color="inherit" size="large">
            <Home />
          </IconButton>
          <IconButton onClick={logout} aria-label="Logout" color="inherit" size="large">
            <ExitToApp />
          </IconButton>
        </Box>
      )}
    </StyledAppBar>
  );
};

export default AdminAppBar;
