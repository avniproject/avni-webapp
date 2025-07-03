import React from "react";
import { styled } from '@mui/material/styles';
import PropTypes from "prop-types";
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Tooltip } from "@mui/material";

export const ENCOUNTER_MODES = {
  SCHEDULE: "schedule_a_visit",
  UPLOAD: "upload_visit_details",
};

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const EncounterModes = ({ mode, setMode }) => {
  const handleChange = event => {
    setMode(event.target.value);
  };

  return (
    <StyledFormControl component="fieldset">
      <FormLabel component="legend">Select Encounter Mode</FormLabel>
      <RadioGroup row aria-label="encounter-mode" name="encounter-mode" value={mode} onChange={handleChange}>
        <Tooltip title="Schedule a new visit" placement="bottom-start" arrow>
          <FormControlLabel value={ENCOUNTER_MODES.SCHEDULE} control={<Radio color="primary" />} label="Schedule a visit" />
        </Tooltip>
        <Tooltip title="Upload visit details" placement="bottom-start" arrow>
          <FormControlLabel value={ENCOUNTER_MODES.UPLOAD} control={<Radio color="primary" />} label="Upload visit details" />
        </Tooltip>
      </RadioGroup>
    </StyledFormControl>
  );
};

EncounterModes.propTypes = {
  mode: PropTypes.string,
  setMode: PropTypes.func.isRequired,
};

EncounterModes.defaultProps = {
  mode: ENCOUNTER_MODES.SCHEDULE,
};

export default EncounterModes;