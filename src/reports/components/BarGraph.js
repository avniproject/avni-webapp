import { ResponsiveBar } from "@nivo/bar";
import React from "react";
import { Grid, Typography, Box } from "@mui/material";
import _ from "lodash";

const BarGraph = ({ data, title, id }) => {
  const dataLength = data.length;
  const layout = dataLength > 20 ? "horizontal" : "vertical";
  const xLabel = dataLength > 20 ? "Count" : "Indicator";
  const yLabel = dataLength > 20 ? "Indicator" : "Count";
  const height = dataLength > 20 ? dataLength * 23 : 500;
  const enableGridY = dataLength <= 20;
  const enableGridX = dataLength > 20;
  const maxLengthIndicator = _.maxBy(data, ({ indicator }) => indicator.length).indicator.length;

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
        <Grid item>
          <Typography variant="h6" gutterBottom align={"center"}>
            {title}
          </Typography>
        </Grid>
        <Grid item>
          <div style={{ height: height, flex: 1 }}>
            <ResponsiveBar
              key={id}
              data={data}
              keys={["count"]}
              indexBy={"indicator"}
              tooltip={({ data }) => `${data.indicator} : ${data.count}`}
              layout={layout}
              margin={{
                top: 10,
                right: 10 * maxLengthIndicator,
                bottom: 5 * maxLengthIndicator,
                left: 50
              }}
              padding={0.3}
              innerPadding={0.3}
              colors={{ scheme: "nivo" }}
              colorBy={"index"}
              borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: `${xLabel}`,
                legendPosition: "middle",
                legendOffset: 4 * maxLengthIndicator
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: `${yLabel}`,
                legendPosition: "middle",
                legendOffset: -45
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
              legends={[
                {
                  dataFrom: "indexes",
                  anchor: "bottom-right",
                  direction: "column",
                  justify: false,
                  translateX: 120,
                  translateY: 0,
                  itemsSpacing: 2,
                  itemWidth: 100,
                  itemHeight: 20,
                  itemDirection: "left-to-right",
                  itemOpacity: 0.85,
                  symbolSize: 20,
                  effects: [
                    {
                      on: "hover",
                      style: {
                        itemOpacity: 1
                      }
                    }
                  ]
                }
              ]}
              animate={true}
              motionStiffness={90}
              motionDamping={15}
              enableGridY={enableGridY}
              enableGridX={enableGridX}
            />
          </div>
        </Grid>
      </Grid>
    </Box>
  );
};
export default BarGraph;
