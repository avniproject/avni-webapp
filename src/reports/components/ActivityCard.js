import React from "react";
import { Grid } from "@material-ui/core";
import { map } from "lodash";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";

const ActivityCard = ({ title, total, data }) => {
  return (
    <Box border={1.5} mb={2} borderColor={"#ddd"} p={2}>
      <Grid
        container
        direction={"column"}
        alignItems="center"
        justifyContent="center"
        style={{ minWidth: "30vh" }}
      >
        <Grid item>
          <Typography gutterBottom variant="h5" align={"center"}>
            {title}
          </Typography>
        </Grid>
        <Grid item>
          <Typography gutterBottom variant="h5" align={"center"}>
            {total}
          </Typography>
        </Grid>
        <Grid item container direction={"row"} spacing={1} alignItems="center" justify={"center"}>
          {map(data, ({ indicator, count }, index) => (
            <Box border={1} m={1} borderColor={"#ddd"} p={2} key={index}>
              <Grid
                item
                container
                direction={"column"}
                key={index}
                xs
                wrap={"nowrap"}
                style={{ minWidth: "10vh" }}
              >
                <Grid item>
                  <Typography gutterBottom variant="subtitle1" align={"center"}>
                    {indicator}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography gutterBottom variant="subtitle1" align={"center"}>
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
