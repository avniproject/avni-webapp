import React from "react";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import Grid from "@material-ui/core/Grid";
import httpClient from "../../common/utils/httpClient";
import { HomePageCard } from "./HomePageCard";
import SurroundSound from "@material-ui/icons/SurroundSound";
import { Privilege } from "openchs-models";
import UserInfo from "../../common/model/UserInfo";
import { connect } from "react-redux";
import ApplicationContext from "../../ApplicationContext";

const Homepage = ({ userInfo }) => {
  httpClient.saveAuthTokenForAnalyticsApp();

  const showAnalytics = UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.Analytics);

  return (
    <ScreenWithAppBar appbarTitle={"Avni Web Console"}>
      <Grid container justify="center">
        <HomePageCard href={"/#/admin/user"} name={"Admin"} customIcon={"supervisor_account"} />
        <HomePageCard href={"/#/appdesigner"} name={"App Designer"} customIcon={"architecture"} />
        <HomePageCard href={"/#/documentation"} name={"Documentation"} customIcon={"article"} />
        <HomePageCard
          href={"/#/assignment"}
          name={"Assignment"}
          customIcon={"assignment_turned_in"}
        />
        <HomePageCard
          href={"/#/broadcast"}
          name={"Broadcast"}
          customIconComponent={<SurroundSound color="primary" style={{ fontSize: 100 }} />}
        />
        <HomePageCard href={"/#/translations"} name={"Translations"} customIcon={"translate"} />
        <HomePageCard href={"/#/export"} name={"Reports"} customIcon={"assessment"} />
        <HomePageCard href={"/#/app"} name={"Data Entry App"} customIcon={"keyboard"} />
        {showAnalytics && (
          <HomePageCard
            href={
              ApplicationContext.isDevEnv()
                ? `http://localhost:3000/avni-media?authToken=${httpClient.getAuthToken()}`
                : "/avni-media"
            }
            name={"Media Viewer "}
            customIcon={"collections"}
          />
        )}
        <HomePageCard href={"/#/help"} name={"Support And Training"} customIcon={"help"} />
      </Grid>
    </ScreenWithAppBar>
  );
};

const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});
export default connect(mapStateToProps)(Homepage);
