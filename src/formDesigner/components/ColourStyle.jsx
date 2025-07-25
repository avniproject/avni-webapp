import { Grid } from "@mui/material";
import { AvniFormLabel } from "../../common/components/AvniFormLabel";
import { PopoverColorPicker } from "../../common/components/PopoverColorPicker";

export const ColourStyle = ({ label, onChange, colour = "", toolTipKey }) => {
  return (
    <Grid
      container
      direction={"row"}
      spacing={2}
      sx={{
        alignItems: "center",
        alignContent: "center"
      }}
    >
      <Grid style={{ marginTop: 10 }}>
        <PopoverColorPicker
          id={label}
          label={label}
          color={colour}
          onChange={onChange}
        />
      </Grid>
      <Grid>
        <AvniFormLabel label={label} toolTipKey={toolTipKey} />
      </Grid>
    </Grid>
  );
};
