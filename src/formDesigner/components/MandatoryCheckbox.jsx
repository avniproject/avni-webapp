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
      // Out of the flow and on one line, so the control keeps the width it has when the concept is
      // not hidden. In flow, the sentence widened the control, pushed its tooltip icon and the next
      // tickbox to the right, and, because the panel is sized to its content, widened the whole panel.
      <FormHelperText
        disabled={false}
        sx={{
          position: "absolute",
          top: "100%",
          left: 0,
          mt: -1,
          whiteSpace: "nowrap",
        }}
      >
        {HIDDEN_MANDATORY_REASON}
      </FormHelperText>
    )}
  </AvniFormControl>
);
