import { ResponsivePie } from "@nivo/pie";
import React from "react";
import { Grid, Typography, Box } from "@mui/material";

const PieGraph = ({ data, title, id }) => {
  return (
    <Box
      sx={{
        border: 1,
        mb: 2,
        borderColor: "#ddd",
        p: 2
      }}
    >
      <Grid container direction={"column"}>
        <Grid>
          <Typography variant="h6" sx={{ mb: 1, textAlign: "center" }}>
            {title}
          </Typography>
        </Grid>
        <Grid>
          <div style={{ height: 500, flex: 1 }}>
            <ResponsivePie
              key={id}
              data={data}
              margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              colors={{ scheme: "nivo" }}
              borderWidth={1}
              borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
              radialLabelsSkipAngle={9}
              radialLabelsTextXOffset={3}
              radialLabelsTextColor="#333333"
              radialLabelsLinkOffset={-14}
              radialLabelsLinkDiagonalLength={33}
              radialLabelsLinkHorizontalLength={6}
              radialLabelsLinkStrokeWidth={2}
              radialLabelsLinkColor={{ from: "color" }}
              slicesLabelsSkipAngle={10}
              slicesLabelsTextColor="#333333"
              animate={true}
              motionStiffness={90}
              motionDamping={15}
              defs={[
                {
                  id: "dots",
                  type: "patternDots",
                  background: "inherit",
                  color: "rgba(255, 255, 255, 0.3)",
                  size: 4,
                  padding: 1,
                  stagger: true
                },
                {
                  id: "lines",
                  type: "patternLines",
                  background: "inherit",
                  color: "rgba(255, 255, 255, 0.3)",
                  rotation: -45,
                  lineWidth: 6,
                  spacing: 10
                }
              ]}
              legends={[
                {
                  anchor: "right",
                  direction: "column",
                  itemDirection: "left-to-right",
                  translateX: -200,
                  translateY: -60,
                  itemWidth: 100,
                  itemHeight: 18,
                  itemTextColor: "#999",
                  symbolSize: 18,
                  symbolShape: "square",
                  effects: [
                    {
                      on: "hover",
                      style: {
                        itemTextColor: "#000"
                      }
                    }
                  ]
                }
              ]}
            />
          </div>
        </Grid>
      </Grid>
    </Box>
  );
};
export default PieGraph;
