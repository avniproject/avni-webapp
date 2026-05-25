import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Tooltip,
} from "@mui/material";

export const PROGRAM_ENROLMENT_MODES = {
  UPLOAD: "upload_enrolments",
  EXIT: "upload_exited_enrolments",
};

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const ProgramEnrolmentModes = ({
  mode = PROGRAM_ENROLMENT_MODES.UPLOAD,
  setMode,
}) => {
  const handleChange = (event) => {
    setMode(event.target.value);
  };

  return (
    <StyledFormControl component="fieldset">
      <FormLabel component="legend">Select Enrolment Mode</FormLabel>
      <RadioGroup
        row
        aria-label="program-enrolment-mode"
        name="program-enrolment-mode"
        value={mode}
        onChange={handleChange}
      >
        <Tooltip
          title="Upload program enrolments in their active state (default)"
          placement="bottom-start"
          arrow
        >
          <FormControlLabel
            value={PROGRAM_ENROLMENT_MODES.UPLOAD}
            control={<Radio color="primary" />}
            label="Upload enrolments"
          />
        </Tooltip>
        <Tooltip
          title="Upload enrolments that began and ended in the source organisation; one row carries both enrolment and exit observations"
          placement="bottom-start"
          arrow
        >
          <FormControlLabel
            value={PROGRAM_ENROLMENT_MODES.EXIT}
            control={<Radio color="primary" />}
            label="Upload exited enrolments"
          />
        </Tooltip>
      </RadioGroup>
    </StyledFormControl>
  );
};

ProgramEnrolmentModes.propTypes = {
  mode: PropTypes.string,
  setMode: PropTypes.func.isRequired,
};

export default ProgramEnrolmentModes;
