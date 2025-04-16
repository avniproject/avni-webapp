import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import Tooltip from "@material-ui/core/Tooltip";

export const MODES = {
  SCHEDULE: "schedule_a_visit",
  UPLOAD: "upload_visit_details"
};

const useStyles = makeStyles(theme => ({
  formControl: {
    marginTop: theme.spacing(2)
  }
}));

const EncounterModes = ({ mode, setMode }) => {
  const classes = useStyles();

  const handleChange = event => {
    setMode(event.target.value);
  };

  return (
    <FormControl component="fieldset" className={classes.formControl}>
      <FormLabel component="legend">Select Encounter Mode</FormLabel>
      <RadioGroup row aria-label="encounter-mode" name="encounter-mode" value={mode} onChange={handleChange}>
        <Tooltip title="Schedule a new visit" placement="bottom-start" arrow>
          <FormControlLabel value={MODES.SCHEDULE} control={<Radio color="primary" />} label="Schedule a visit" />
        </Tooltip>
        <Tooltip title="Upload visit details" placement="bottom-start" arrow>
          <FormControlLabel value={MODES.UPLOAD} control={<Radio color="primary" />} label="Upload visit details" />
        </Tooltip>
      </RadioGroup>
    </FormControl>
  );
};

EncounterModes.propTypes = {
  mode: PropTypes.string,
  setMode: PropTypes.func.isRequired
};

EncounterModes.defaultProps = {
  mode: MODES.SCHEDULE
};

export default EncounterModes;
