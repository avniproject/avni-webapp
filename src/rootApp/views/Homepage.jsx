import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import { Grid } from "@mui/material";
import { useSelector } from "react-redux";
import { httpClient } from "../../common/utils/httpClient";
import { HomePageCard } from "./HomePageCard";
import {
  SurroundSound,
  Assessment,
  AssignmentTurnedIn,
  Build,
  Collections,
  Description,
  Help,
  Keyboard,
  SupervisorAccount,
  Translate
} from "@mui/icons-material";
import { Privilege } from "openchs-models";
import UserInfo from "../../common/model/UserInfo";
import ApplicationContext from "../../ApplicationContext";

const Homepage = () => {
  const userInfo = useSelector(state => state.app.userInfo);
  const organisation = useSelector(state => state.app.organisation);

  httpClient.saveAuthTokenForAnalyticsApp();

  const showAnalytics = UserInfo.hasPrivilege(
    userInfo,
    Privilege.PrivilegeType.Analytics
  );
  const showDataEntryApp = UserInfo.hasPrivilege(
    userInfo,
    Privilege.PrivilegeType.ViewEditEntitiesOnDataEntryApp
  );

  return (
    <ScreenWithAppBar
      appbarTitle={`Avni Web Console - ${
        organisation.organisationCategoryName
      }`}
    >
      <Grid
        container
        sx={{
          justifyContent: "center"
        }}
      >
        <HomePageCard
          href={"/#/admin"}
          name={"Admin"}
          customIconComponent={
            <SupervisorAccount color="primary" style={{ fontSize: 100 }} />
          }
        />
        <HomePageCard
          href={"/#/appdesigner"}
          name={"App Designer"}
          customIconComponent={
            <Build color="primary" style={{ fontSize: 100 }} />
          }
        />
        <HomePageCard
          href={"/#/documentation"}
          name={"Documentation"}
          customIconComponent={
            <Description color="primary" style={{ fontSize: 100 }} />
          }
        />
        <HomePageCard
          href={"/#/assignment"}
          name={"Assignment"}
          customIconComponent={
            <AssignmentTurnedIn color="primary" style={{ fontSize: 100 }} />
          }
        />
        <HomePageCard
          href={"/#/broadcast"}
          name={"Broadcast"}
          customIconComponent={
            <SurroundSound color="primary" style={{ fontSize: 100 }} />
          }
        />
        <HomePageCard
          href={"/#/translations"}
          name={"Translations"}
          customIconComponent={
            <Translate color="primary" style={{ fontSize: 100 }} />
          }
        />
        <HomePageCard
          href={"/#/export"}
          name={"Reports"}
          customIconComponent={
            <Assessment color="primary" style={{ fontSize: 100 }} />
          }
        />
        {showDataEntryApp && (
          <HomePageCard
            href={"/#/app"}
            name={"Data Entry App"}
            customIconComponent={
              <Keyboard color="primary" style={{ fontSize: 100 }} />
            }
          />
        )}
        {showAnalytics && (
          <HomePageCard
            href={
              ApplicationContext.isDevEnv()
                ? `http://localhost:3000/avni-media?authToken=${httpClient.getAuthToken()}`
                : "/avni-media"
            }
            name={"Media Viewer "}
            customIconComponent={
              <Collections color="primary" style={{ fontSize: 100 }} />
            }
          />
        )}
        <HomePageCard
          href={"/#/help"}
          name={"Support And Training"}
          customIconComponent={
            <Help color="primary" style={{ fontSize: 100 }} />
          }
        />
      </Grid>
    </ScreenWithAppBar>
  );
};

export default Homepage;
