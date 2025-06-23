import { Grid } from "@mui/material";
import TutorialCard from "./TutorialCard";
import React from "react";
import { ConfirmationNumber, Description, Event, Forum, VideoLibrary } from "@mui/icons-material";

const Resources = () => {
  const sessionFooter = (
    <span style={{ fontWeight: "bold" }}>
      <p />
      ~15 min session
      <br />
      Via Screenshare
    </span>
  );

  return (
    <Grid
      container
      spacing={3}
      sx={{
        alignItems: "center"
      }}
    >
      <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
        <TutorialCard
          title={"Self service help articles"}
          content={"Are you trying out Avni for the first time? Here's all the information you'll need"}
          href={"https://avni.readme.io/docs/implementers-concept-guide-introduction"}
          iconComponent={<Description color="primary" style={{ fontSize: 60, color: "#009688" }} />}
        />
      </Grid>
      <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
        <TutorialCard
          title={"Avni youtube channel"}
          content={"Check out our youtube channel for the latest tutorials. We cover everything you could need to get started"}
          href={"https://www.youtube.com/channel/UCShsfKJlw0B3B6Pg2DmQkSQ"}
          iconComponent={<VideoLibrary color="primary" style={{ fontSize: 60, color: "#d50000" }} />}
        />
      </Grid>
      <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
        <TutorialCard
          title={"Coaching/support session"}
          content={"Looking for best practices or troubleshooting assistance?"}
          href={"https://calendly.com/openchssupport-customersuccess/support-session"}
          footer={sessionFooter}
          iconComponent={<Event color="primary" style={{ fontSize: 60, color: "#40c4ff" }} />}
        />
      </Grid>
      <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
        <TutorialCard
          title={"Submit a support ticket"}
          content={"Can't find answer in our help article? Click here to submit a ticket to the Avni support team"}
          href={"https://avni.freshdesk.com/support/home"}
          iconComponent={<ConfirmationNumber color="primary" style={{ fontSize: 60, color: "#66bb6a" }} />}
        />
      </Grid>
      <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
        <TutorialCard
          title={"Ask the community"}
          content={"Ask question, post tips and even answer each other's question through community forums"}
          href={"https://gitter.im/avniproject/avni"}
          iconComponent={<Forum color="primary" style={{ fontSize: 60, color: "#ad1457" }} />}
        />
      </Grid>
    </Grid>
  );
};
export default Resources;
