import React from "react";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import PropTypes from "prop-types";

export default function NumericConcept(props) {
  const classes = { width: 195, marginRight: 10 };
  return (
    <>
      <Grid container justify="flex-start">
        <Grid item sm={12}>
          <FormControl>
            <TextField
              type="number"
              id="lowAbsolute"
              label="Low Absolute"
              placeholder="Enter Low Absolute"
              margin="normal"
              style={classes}
              onChange={event => props.onNumericConceptAttributeAssignment(event)}
              InputProps={{ inputProps: { min: 0 } }}
              defaultValue={props.numericDataTypeAttributes.lowAbsolute}
            />
          </FormControl>
          <FormControl>
            <TextField
              type="number"
              id="highAbsolute"
              label="High Absolute"
              placeholder="Enter High Absolute"
              margin="normal"
              style={classes}
              onChange={event => props.onNumericConceptAttributeAssignment(event)}
              InputProps={{ inputProps: { min: 0 } }}
              defaultValue={props.numericDataTypeAttributes.highAbsolute}
            />
            {props.numericDataTypeAttributes.error.absoluteValidation && (
              <FormHelperText error>High absolute must be greater than low absolute</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item sm={12}>
          <FormControl>
            <TextField
              type="number"
              id="lowNormal"
              label="Low Normal"
              placeholder="Enter Low Normal"
              margin="normal"
              style={classes}
              onChange={event => props.onNumericConceptAttributeAssignment(event)}
              InputProps={{ inputProps: { min: 0 } }}
              defaultValue={props.numericDataTypeAttributes.lowNormal}
            />
          </FormControl>
          <FormControl>
            <TextField
              type="number"
              id="highNormal"
              label="High Normal"
              placeholder="Enter High Normal"
              margin="normal"
              style={classes}
              onChange={event => props.onNumericConceptAttributeAssignment(event)}
              InputProps={{ inputProps: { min: 0 } }}
              defaultValue={props.numericDataTypeAttributes.highNormal}
            />
            {props.numericDataTypeAttributes.error.normalValidation && (
              <FormHelperText error>High normal must be greater than low normal</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <FormControl>
          <TextField
            type="string"
            id="unit"
            label="Unit"
            placeholder="Enter unit"
            margin="normal"
            onChange={event => props.onNumericConceptAttributeAssignment(event)}
            defaultValue={props.numericDataTypeAttributes.unit}
            style={classes}
          />
        </FormControl>
      </Grid>
    </>
  );
}

NumericConcept.propTypes = {
  onNumericConceptAttributeAssignment: PropTypes.func.isRequired,
  numericDataTypeAttributes: PropTypes.object.isRequired
};
