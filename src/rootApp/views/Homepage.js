import React from "react";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import Grid from "@material-ui/core/Grid";
import httpClient from "../../common/utils/httpClient";
import { isProdEnv } from "../../common/constants";
import { HomePageCard } from "./HomePageCard";

const Homepage = ({ user }) => {
  httpClient.saveAuthTokenForAnalyticsApp();

  return (
    <ScreenWithAppBar appbarTitle={"Avni Web Console"}>
      <Grid container justify="center">
        <HomePageCard href={"/#/admin/user"} name={"Admin"} customicon={"supervisor_account"} />
        <HomePageCard href={"/#/appdesigner"} name={"App Designer"} customicon={"architecture"} />
        <HomePageCard href={"/#/documentation"} name={"Documentation"} customicon={"article"} />
        <HomePageCard
          href={"/#/assignment"}
          name={"Assignment"}
          customicon={"assignment_turned_in"}
        />
        <HomePageCard href={"/#/news"} name={"News Broadcasts"} customicon={"speaker"} />
        <HomePageCard href={"/#/translations"} name={"Translations"} customicon={"translate"} />
        <HomePageCard href={"/#/export"} name={"Reports"} customicon={"assessment"} />
        <HomePageCard href={"/#/app"} name={"Data Entry App"} customicon={"keyboard"} />
        <HomePageCard href={"/#/help"} name={"Support And Training"} customicon={"help"} />
        {isProdEnv && (
          <HomePageCard
            href={"/analytics/activities"}
            name={"Canned Reports"}
            customicon={"assessment"}
          />
        )}
      </Grid>
    </ScreenWithAppBar>
  );
};

export default Homepage;
