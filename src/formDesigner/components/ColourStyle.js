import React from "react";
import Grid from "@material-ui/core/Grid";
import ColorPicker from "material-ui-rc-color-picker";
import { colorPickerCSS } from "../../adminApp/Constant";
import { AvniFormLabel } from "../../common/components/AvniFormLabel";

export const ColourStyle = ({ label, onChange, colour = "", toolTipKey }) => {
  return (
    <Grid
      item
      container
      direction={"row"}
      spacing={2}
      alignItems={"center"}
      alignContent={"center"}
    >
      <Grid item style={{ marginTop: 10 }}>
        <ColorPicker
          id={label}
          label={label}
          style={colorPickerCSS}
          color={colour}
          onChange={({ color }) => onChange(color)}
        />
      </Grid>
      <Grid item>
        <AvniFormLabel label={label} toolTipKey={toolTipKey} />
      </Grid>
    </Grid>
  );
};
