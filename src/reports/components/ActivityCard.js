import React from "react";
import { Box, GridLegacy as Grid, Typography } from "@mui/material";
import { map } from "lodash";

const ActivityCard = ({ title, total, data }) => {
  return (
    <Box
      sx={{
        border: 1.5,
        mb: 2,
        borderColor: "#ddd",
        p: 2
      }}
    >
      <Grid
        container
        direction={"column"}
        style={{ minWidth: "30vh" }}
        sx={{
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Grid item>
          <Typography sx={{ mb: 1, textAlign: "center" }} variant="h5">
            {title}
          </Typography>
        </Grid>
        <Grid item>
          <Typography sx={{ mb: 1, textAlign: "center" }} variant="h5">
            {total}
          </Typography>
        </Grid>
        <Grid
          item
          container
          direction={"row"}
          spacing={1}
          sx={{
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {map(data, ({ indicator, count }, index) => (
            <Box
              key={index}
              sx={{
                border: 1,
                m: 1,
                borderColor: "#ddd",
                p: 2
              }}
            >
              <Grid item container direction={"column"} key={index} xs wrap={"nowrap"} style={{ minWidth: "10vh" }}>
                <Grid item>
                  <Typography sx={{ mb: 1, textAlign: "center" }} variant="subtitle1">
                    {indicator}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography sx={{ mb: 1, textAlign: "center" }} variant="subtitle1">
                    {count}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
};
export default ActivityCard;
