import { Box, GridLegacy as Grid, Typography } from "@mui/material";
import React from "react";

const Header = () => {
  return (
    <Box
      sx={{
        pb: 3
      }}
    >
      <Grid
        container
        direction={"column"}
        spacing={1}
        sx={{
          alignItems: "center"
        }}
      >
        <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
          <Typography variant="h3" sx={{ textAlign: "center" }}>
            We are here to help!
          </Typography>
        </Grid>
        <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
          <Typography variant="body2" sx={{ textAlign: "center" }}>
            While you can always email support@avni.freshdesk.com, you can also search our help articles, check out our YouTube channel, or
            schedule time with our product experts for you and your team.
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};
export default Header;
