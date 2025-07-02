import React from "react";
import { styled } from '@mui/material/styles';
import { AppBar } from "react-admin";
import { Typography, IconButton } from "@mui/material";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { getUserInfo } from "../../rootApp/ducks";
import { OrganisationOptions } from "./OrganisationOptions";
import { Home } from "@mui/icons-material";
import CurrentUserService from "../service/CurrentUserService";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center'
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  flex: 1,
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  overflow: "hidden"
}));

const AdminAppBar = ({ getUserInfo, organisation, authSession, history, organisations, userInfo, ...rest }) => {
  return (
    <StyledAppBar {...rest}>
      <StyledTypography variant="h6" sx={{ color: "inherit" }} id="react-admin-title" />
      <OrganisationOptions
        getUserInfo={getUserInfo}
        user={authSession}
        userInfo={userInfo}
        organisation={organisation}
        history={history}
        organisations={organisations}
      />
      <div>
        <b>{organisation.name} </b> ({authSession.username})
      </div>
      {CurrentUserService.hasOrganisationContext(userInfo) && (
        <IconButton onClick={() => history.push("/home")} aria-label="Home" color="inherit" size="large">
          <Home />
        </IconButton>
      )}
    </StyledAppBar>
  );
};

const mapStateToProps = state => ({
  organisation: state.app.organisation,
  authSession: state.app.authSession,
  organisations: state.app.organisations,
  userInfo: state.app.userInfo
});

export default withRouter(
  connect(
    mapStateToProps,
    { getUserInfo }
  )(AdminAppBar)
);