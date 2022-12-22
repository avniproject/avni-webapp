import React from "react";
import AppBar from "../common/components/AppBar";
import { HomePageCard } from "../rootApp/views/HomePageCard";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import Grid from "@material-ui/core/Grid";

const Communication = () => {
  return (
    <React.Fragment>
      <AppBar title={"Communication"} position={"sticky"} />
      <Grid container justify="center">
        <HomePageCard href={"/#/news"} name={"News Broadcasts"} customIcon={"speaker"} />
        <HomePageCard
          href=""
          name="WhatsApp"
          customIconComponent={<WhatsAppIcon color="primary" style={{ fontSize: 100 }} />}
        />
      </Grid>
    </React.Fragment>
  );
};

export default Communication;
