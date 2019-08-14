import React, { Component } from "react";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";

class NumericDataType extends Component {
  render() {
    const classes = { width: 195, marginRight: 10 };
    const {
      lowAbsolute,
      highAbsolute,
      lowNormal,
      highNormal,
      unit,
      absoluteValidation,
      normalValidation
    } = this.props.numericDataTypeProperties;

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
                onChange={event => this.props.onNumericDataType(event)}
                InputProps={{ inputProps: { min: 0 } }}
                defaultValue={lowAbsolute}
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
                onChange={event => this.props.onNumericDataType(event)}
                InputProps={{ inputProps: { min: 0 } }}
                defaultValue={highAbsolute}
              />
              {absoluteValidation && (
                <FormHelperText error>
                  High absolute must be greater than low absolute
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
                onChange={event => this.props.onNumericDataType(event)}
                InputProps={{ inputProps: { min: 0 } }}
                defaultValue={lowNormal}
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
                onChange={event => this.props.onNumericDataType(event)}
                InputProps={{ inputProps: { min: 0 } }}
                defaultValue={highNormal}
              />
              {normalValidation && (
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
              onChange={event => this.props.onNumericDataType(event)}
              defaultValue={unit}
              style={classes}
            />
          </FormControl>
        </Grid>
      </>
    );
  }
}

export default NumericDataType;
