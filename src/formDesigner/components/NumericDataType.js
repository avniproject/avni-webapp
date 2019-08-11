import React, { Component } from "react";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";

class NumericDataType extends Component {
  render() {
    const classes = { width: 228 };
    const {
      lowAbsolute,
      highAbsolute,
      lowNormal,
      highNormal,
      unit
    } = this.props.numericDataTypeProperties;

    return (
      <>
        <Grid container justify="center">
          <FormControl>
            <TextField
              type="number"
              id="lowAbsolute"
              label="Low Absolute"
              placeholder="Enter Low Absolute"
              margin="normal"
              style={{ width: 223, marginRight: 10 }}
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
          </FormControl>
        </Grid>
        <Grid container justify="center">
          <FormControl>
            <TextField
              type="number"
              id="lowNormal"
              label="Low Normal"
              placeholder="Enter Low Normal"
              margin="normal"
              style={{ width: 223, marginRight: 10 }}
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
          </FormControl>
        </Grid>
        <Grid container justify="center">
          <FormControl>
            <TextField
              type="string"
              id="unit"
              label="Unit"
              placeholder="Enter unit"
              margin="normal"
              onChange={event => this.props.onNumericDataType(event)}
              defaultValue={unit}
            />
          </FormControl>
        </Grid>
      </>
    );
  }
}

export default NumericDataType;
