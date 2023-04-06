import React from "react";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import Grid from "@material-ui/core/Grid";
import httpClient from "../../common/utils/httpClient";
import { isProdEnv } from "../../common/constants";
import { HomePageCard } from "./HomePageCard";
import SurroundSound from "@material-ui/icons/SurroundSound";
import { useState, useEffect } from "react";

const Homepage = ({ user }) => {
  httpClient.saveAuthTokenForAnalyticsApp();

  const [orgUUID, setOrgUUID] = useState(null);
  useEffect(() => {
    const fetchOrgUUID = async () => {
      const uuid = httpClient.getOrgUUID();
      setOrgUUID(uuid);
    };
    fetchOrgUUID();
  }, []);

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
        <HomePageCard
          href={`/avni-media?orgUUID=${orgUUID}`}
          name={"Media Viewer "}
          customIcon={"collections"}
        />
        <HomePageCard href={"/#/help"} name={"Support And Training"} customIcon={"help"} />
        {isProdEnv && (
          <HomePageCard
            href={"/analytics/activities"}
            name={"Canned Reports"}
            customIcon={"assessment"}
          />
        )}
      </Grid>
    </ScreenWithAppBar>
  );
};

export default Homepage;
