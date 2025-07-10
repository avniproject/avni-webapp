import React, { useState, useEffect } from "react";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import PropTypes from "prop-types";

export default function NumericConcept(props) {
  const classes = { width: 195, marginRight: 10 };

  const [values, setValues] = useState({
    lowAbsolute: props.numericDataTypeAttributes.lowAbsolute || "",
    highAbsolute: props.numericDataTypeAttributes.highAbsolute || "",
    lowNormal: props.numericDataTypeAttributes.lowNormal || "",
    highNormal: props.numericDataTypeAttributes.highNormal || "",
    unit: props.numericDataTypeAttributes.unit || "",
  });

  const [errors, setErrors] = useState({
    absoluteValidation: false,
    normalValidation: false,
  });

  const validate = (newValues) => {
    const la = parseFloat(newValues.lowAbsolute);
    const ha = parseFloat(newValues.highAbsolute);
    const ln = parseFloat(newValues.lowNormal);
    const hn = parseFloat(newValues.highNormal);

    setErrors({
      absoluteValidation: !isNaN(la) && !isNaN(ha) && (ha < la || (!isNaN(hn) && ha < hn)),
      normalValidation: !isNaN(ln) && !isNaN(hn) && (hn < ln || (!isNaN(la) && hn < la)),
    });
  };

  const handleChange = (key) => (event) => {
    const value = event.target.value;
    const newValues = { ...values, [key]: value };
    setValues(newValues);
    validate(newValues);

    if (props.inlineConcept) {
      props.onNumericConceptAttributeAssignment(props.groupIndex, key, value, props.index);
    } else {
      props.onNumericConceptAttributeAssignment({ target: { id: key, value } });
    }
  };

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
              onChange={handleChange("lowAbsolute")}
              InputProps={{ inputProps: { min: 0 } }}
              value={values.lowAbsolute}
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
              onChange={handleChange("highAbsolute")}
              InputProps={{ inputProps: { min: 0 } }}
              value={values.highAbsolute}
            />
            {errors.absoluteValidation && (
              <FormHelperText error>
                High absolute must be ≥ low absolute and high normal
              </FormHelperText>
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
              onChange={handleChange("lowNormal")}
              InputProps={{ inputProps: { min: 0 } }}
              value={values.lowNormal}
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
              onChange={handleChange("highNormal")}
              InputProps={{ inputProps: { min: 0 } }}
              value={values.highNormal}
            />
            {errors.normalValidation && (
              <FormHelperText error>
                High normal must be ≥ low normal and low absolute
              </FormHelperText>
            )}
          </FormControl>
        </Grid>
        <FormControl>
          <TextField
            type="text"
            id="unit"
            label="Unit"
            placeholder="Enter unit"
            margin="normal"
            onChange={handleChange("unit")}
            value={values.unit}
            style={classes}
          />
        </FormControl>
      </Grid>
    </>
  );
}

NumericConcept.propTypes = {
  onNumericConceptAttributeAssignment: PropTypes.func.isRequired,
  numericDataTypeAttributes: PropTypes.object.isRequired,
};

NumericConcept.defaultProps = {
  inlineConcept: false,
};
