import React, { useEffect, useState } from "react";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import Grid from "@material-ui/core/Grid";
import httpClient from "../../common/utils/httpClient";
import { HomePageCard } from "./HomePageCard";
import SurroundSound from "@material-ui/icons/SurroundSound";
import axios from "axios";
import CurrentUserService from "../../common/service/CurrentUserService";
import { Privilege } from "openchs-models";

const Homepage = ({ user }) => {
  httpClient.saveAuthTokenForAnalyticsApp();

  const [userData, setUserData] = useState(null);
  useEffect(() => {
    const fetchOrgID = async () => {
      const resp = await axios("/web/userInfo");
      // resp.data.hasAllPrivileges = false; //Uncomment for testing
      // resp.data.privileges = [Privilege.PrivilegeType.EditOrganisationConfiguration]; //Uncomment for testing
      setUserData(resp.data);
    };
    fetchOrgID();
  }, []);
  const showAssignment = CurrentUserService.isAllowedToAccess(userData, [
    Privilege.PrivilegeType.EditTask,
    Privilege.PrivilegeType.DeleteTask
  ]);
  const canEditOrganisationConfig = CurrentUserService.isAllowedToAccess(userData, [
    Privilege.PrivilegeType.EditOrganisationConfiguration
  ]);
  const showDocumentation = CurrentUserService.isAllowedToAccess(userData, [
    Privilege.PrivilegeType.EditDocumentation
  ]);
  const showReports = CurrentUserService.isAllowedToAccess(userData, [
    Privilege.PrivilegeType.Reports
  ]);

  return (
    <ScreenWithAppBar appbarTitle={"Avni Web Console"}>
      <Grid container justify="center">
        <HomePageCard href={"/#/admin/user"} name={"Admin"} customIcon={"supervisor_account"} />
        <HomePageCard href={"/#/appdesigner"} name={"App Designer"} customIcon={"architecture"} />
        {showDocumentation && (
          <HomePageCard href={"/#/documentation"} name={"Documentation"} customIcon={"article"} />
        )}
        {showAssignment && (
          <HomePageCard
            href={"/#/assignment"}
            name={"Assignment"}
            customIcon={"assignment_turned_in"}
          />
        )}
        {canEditOrganisationConfig && (
          <HomePageCard
            href={"/#/broadcast"}
            name={"Broadcast"}
            customIconComponent={<SurroundSound color="primary" style={{ fontSize: 100 }} />}
          />
        )}
        {canEditOrganisationConfig && (
          <HomePageCard href={"/#/translations"} name={"Translations"} customIcon={"translate"} />
        )}
        {showReports && (
          <HomePageCard href={"/#/export"} name={"Reports"} customIcon={"assessment"} />
        )}
        <HomePageCard href={"/#/app"} name={"Data Entry App"} customIcon={"keyboard"} />
        <HomePageCard
          href={`/avni-media?orgID=${userData && userData.organisationId}&username=${userData &&
            userData.username}`}
          name={"Media Viewer "}
          customIcon={"collections"}
        />
        <HomePageCard href={"/#/help"} name={"Support And Training"} customIcon={"help"} />
      </Grid>
    </ScreenWithAppBar>
  );
};

export default Homepage;
