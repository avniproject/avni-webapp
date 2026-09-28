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
      Answers are saved and reach reporting, but are never shown in the app.
    </FormHelperText>
  </AvniFormControl>
);

export const HIDDEN_MANDATORY_REASON =
  "A hidden question is never required, so this has no effect.";

export const HiddenQuestionMarker = () => (
  <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 1 }}>
    <Chip id="hiddenQuestionMarker" label="Hidden" size="small" />
    <Typography variant="caption">
      Answers are saved but never shown in the app. Change this on the concept.
    </Typography>
  </Stack>
);
