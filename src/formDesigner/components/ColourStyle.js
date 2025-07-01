import React from "react";
import { GridLegacy as Grid } from "@mui/material";
import { AvniFormLabel } from "../../common/components/AvniFormLabel";
import { PopoverColorPicker } from "../../common/components/PopoverColorPicker";

export const ColourStyle = ({ label, onChange, colour = "", toolTipKey }) => {
  return (
    <Grid
      item
      container
      direction={"row"}
      spacing={2}
      sx={{
        alignItems: "center",
        alignContent: "center"
      }}
    >
      <Grid item style={{ marginTop: 10 }}>
        <PopoverColorPicker id={label} label={label} color={colour} onChange={onChange} />
      </Grid>
      <Grid item>
        <AvniFormLabel label={label} toolTipKey={toolTipKey} />
      </Grid>
    </Grid>
  );
};
