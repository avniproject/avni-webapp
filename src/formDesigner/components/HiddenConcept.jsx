import { forwardRef } from "react";
import {
  Checkbox,
  Chip,
  FormControlLabel,
  FormHelperText,
  Stack,
  Typography,
} from "@mui/material";
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
      Values recorded for this concept are saved and reach reporting, but are
      never shown in the app.
    </FormHelperText>
  </AvniFormControl>
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
