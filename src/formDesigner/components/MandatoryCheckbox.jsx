import { Checkbox, FormControlLabel, FormHelperText } from "@mui/material";
import { AvniFormControl } from "../../common/components/AvniFormControl";
import { HIDDEN_MANDATORY_REASON } from "./HiddenConcept";

export const MandatoryCheckbox = ({
  mandatory,
  disabled,
  conceptHidden,
  onChange,
}) => (
  <AvniFormControl
    toolTipKey={"APP_DESIGNER_FORM_ELEMENT_MANDATORY"}
    disabled={disabled || conceptHidden}
  >
    <FormControlLabel
      control={
        <Checkbox
          id="mandatoryDetails"
          checked={!!mandatory}
          value={mandatory ? "yes" : "no"}
          onChange={(event) =>
            onChange(event.target.value === "yes" ? false : true)
          }
        />
      }
      label="Mandatory"
    />
    {conceptHidden && (
      <FormHelperText disabled={false}>
        {HIDDEN_MANDATORY_REASON}
      </FormHelperText>
    )}
  </AvniFormControl>
);
