import React, { Component } from "react";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";

class NumericDataType extends Component {
  handleChange = event => {
    this.props.sendValue(event.target.id, event.target.value);
  };
  render() {
    const classes = { width: 228 };
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
              onChange={this.handleChange}
              InputProps={{ inputProps: { min: 0 } }}
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
              onChange={this.handleChange}
              InputProps={{ inputProps: { min: 0 } }}
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
              onChange={this.handleChange}
              InputProps={{ inputProps: { min: 0 } }}
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
              onChange={this.handleChange}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </FormControl>
        </Grid>
        <Grid container justify="center">
          <FormControl>
            <TextField
              required
              type="string"
              id="Unit"
              label="Unit"
              placeholder="Enter unit"
              margin="normal"
              onChange={this.handleChange}
            />
          </FormControl>
        </Grid>
      </>
    );
  }
}

export default NumericDataType;
