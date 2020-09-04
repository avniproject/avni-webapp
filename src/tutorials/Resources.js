import { Grid } from "@material-ui/core";
import TutorialCard from "./TutorialCard";
import React from "react";

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
    <Grid container alignItems={"center"} spacing={3}>
      <Grid item xs={6}>
        <TutorialCard
          title={"Self service help articles"}
          content={
            "Are you trying out Avni for the first time? Here's all the information you'll need"
          }
          href={"https://avni.readme.io/docs/implementers-guide"}
          icon={"article"}
          iconColor={"#009688"}
        />
      </Grid>
      <Grid item xs={6}>
        <TutorialCard
          title={"Avni youtube channel"}
          content={
            "Check out our youtube channel for the latest tutorials. We cover everything you could need to get started"
          }
          href={"https://www.youtube.com/channel/UCShsfKJlw0B3B6Pg2DmQkSQ"}
          icon={"video_library"}
          iconColor={"#d50000"}
        />
      </Grid>
      <Grid item xs={6}>
        <TutorialCard
          title={"Coaching/support session"}
          content={"Looking for best practices or troubleshooting assistance?"}
          href={"https://calendly.com/openchssupport-customersuccess/support-session"}
          footer={sessionFooter}
          icon={"event"}
          iconColor={"#40c4ff"}
        />
      </Grid>
      <Grid item xs={6}>
        <TutorialCard
          title={"Submit a support ticket"}
          content={
            "Can't find answer in our help article? Click here to submit a ticket to the Avni support team"
          }
          href={"https://avni.freshdesk.com/support/home"}
          icon={"confirmation_number"}
          iconColor={"#66bb6a"}
        />
      </Grid>
      <Grid item xs={6}>
        <TutorialCard
          title={"Ask the community"}
          content={
            "Ask question, post tips and even answer each other's question through community forums"
          }
          href={"https://gitter.im/avniproject/avni"}
          icon={"forum"}
          iconColor={"#ad1457"}
        />
      </Grid>
    </Grid>
  );
};

export default Resources;
