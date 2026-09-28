import { Checkbox, FormControlLabel, FormHelperText } from "@mui/material";
import { AvniFormControl } from "../../common/components/AvniFormControl";

export const HiddenConceptCheckbox = ({ checked, onChange }) => (
  <AvniFormControl toolTipKey={"APP_DESIGNER_CONCEPT_HIDDEN"}>
    <FormControlLabel
      control={
        <Checkbox
          id="hidden"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
      }
      label="Hidden"
    />
    <FormHelperText>
      Answers are saved and reach reporting, but are never shown in the app.
    </FormHelperText>
  </AvniFormControl>
);
