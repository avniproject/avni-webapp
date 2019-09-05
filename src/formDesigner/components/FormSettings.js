import React from "react";

import { Input, InputLabel, Select } from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import axios from "axios";
import DownshiftMultiple from "./AutoComplete";
import { Redirect } from "react-router-dom";
import FormHelperText from "@material-ui/core/FormHelperText";
import Grid from "@material-ui/core/Grid";

const FormSettings = props => {
  const classse = {
    select: { width: 400 },
    input: { width: 400 }
  };
  console.log(props.formProperties);
  return (
    <>
      <Grid item sm={12}>
        <InputLabel htmlFor="formType">Form Type</InputLabel>
        <Select
          id="formType"
          name="formType"
          value={props.formProperties.formType}
          // onChange={this.onChangeField.bind(this)}
          style={classse.select}
        >
          <MenuItem value="IndividualProfile">IndividualProfile</MenuItem>
          <MenuItem value="Encounter">Encounter</MenuItem>
          <MenuItem value="ProgramEncounter">ProgramEncounter</MenuItem>
          <MenuItem value="ProgramEnrolment">ProgramEnrollment</MenuItem>
          <MenuItem value="ProgramExit">ProgramExit</MenuItem>
          <MenuItem value="ProgramEnrolmentCancellation">ProgramEnrollmentCancellation</MenuItem>
          <MenuItem value="ChecklistItem">ChecklistItem</MenuItem>
        </Select>
      </Grid>
      <Grid item sm={12}>
        <InputLabel htmlFor="name">Name</InputLabel>
        <Input
          type="text"
          id="formName"
          name="name"
          value={props.formProperties.name}
          placeholder="Enter name"
          // onChange={this.onChangeField.bind(this)}
          style={classse.select}
        />
      </Grid>
    </>
  );
};

export default FormSettings;
