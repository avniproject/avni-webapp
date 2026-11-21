import { forwardRef } from "react";
import { Chip, FormHelperText, Stack, Typography } from "@mui/material";
import { AvniSwitch } from "../../common/components/AvniSwitch";

// Laid out as PhoneNumberConcept lays out Switch on Verification, so the help button sits beside
// the switch. The explanation goes below that row: inside it, its width pushed the help button
// to the far end of the line.
export const HiddenConceptSwitch = ({ checked, onChange }) => (
  <div style={{ marginTop: 10, marginBottom: 10 }}>
    <AvniSwitch
      id="hidden"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      name="Hidden"
      toolTipKey={"APP_DESIGNER_CONCEPT_HIDDEN"}
    />
    <FormHelperText sx={{ ml: 1 }}>
      Values recorded for this concept are saved and reach reporting, but are
      never shown in the app.
    </FormHelperText>
  </div>
);

export const HIDDEN_MANDATORY_REASON =
  "A hidden question is never required, so this has no effect.";

export const HIDDEN_QUESTION_NOTE =
  "Answers are saved but never shown in the app. Change this on the concept.";

// The same chip marks a hidden question in the collapsed header and in the expanded panel.
// It forwards its ref so a Tooltip can wrap it.
export const HiddenChip = forwardRef((props, ref) => (
  <Chip ref={ref} label="Hidden" size="small" {...props} />
));
HiddenChip.displayName = "HiddenChip";

export const HiddenQuestionMarker = () => (
  <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 1 }}>
    <HiddenChip id="hiddenQuestionMarker" />
    <Typography variant="caption">{HIDDEN_QUESTION_NOTE}</Typography>
  </Stack>
);
