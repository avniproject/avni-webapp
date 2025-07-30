import { AppBar } from "react-admin";
import { Typography, IconButton, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Home } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import OrganisationOptions from "./OrganisationOptions";
import { getUserInfo } from "../../rootApp/ducks";
import CurrentUserService from "../service/CurrentUserService";
import {
  CommonAppBarStyles,
  StyledAppBarTitle,
  StyledUserSection,
  StyledOrganisationInfo
} from "./CommonAppBarStyles";

const StyledAppBar = styled(AppBar)(() => ({
  ...CommonAppBarStyles.appBarContainer,
  "& .MuiToolbar-root": {
    ...CommonAppBarStyles.toolbar
  }
}));

const AdminAppBar = props => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const organisation = useSelector(state => state.app.organisation);
  const authSession = useSelector(state => state.app.authSession);
  const organisations = useSelector(state => state.app.organisations);
  const userInfo = useSelector(state => state.app.userInfo);

  return (
    <StyledAppBar {...props}>
      <StyledAppBarTitle variant="h6" id="react-admin-title" />

      <StyledUserSection>
        <OrganisationOptions
          getUserInfo={() => dispatch(getUserInfo())}
          user={authSession}
          userInfo={userInfo}
          organisation={organisation}
          organisations={organisations}
        />
        <StyledOrganisationInfo>
          <b>{organisation?.name}</b> ({authSession?.username})
        </StyledOrganisationInfo>
        {CurrentUserService.hasOrganisationContext(userInfo) && (
          <IconButton
            onClick={() => navigate("/home")}
            aria-label="Home"
            color="inherit"
            size="large"
          >
            <Home />
          </IconButton>
        )}
      </StyledUserSection>
    </StyledAppBar>
  );
};

export default AdminAppBar;
