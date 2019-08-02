import React, { Component } from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";

class NumericDataType extends Component {
  handleChange = event => {
    this.props.sendValue(event.target.id, event.target.value);
  };
  render() {
    return (
      <div>
        <TextField
          type="number"
          id="lowAbsolute"
          label="lowAbsolute"
          placeholder="lowAbsolute"
          margin="normal"
          onChange={this.handleChange}
        />
        <TextField
          type="number"
          id="highAbsolute"
          label="highAbsolute"
          placeholder="highAbsolute"
          margin="normal"
          onChange={this.handleChange}
        />
        <TextField
          type="number"
          id="lowNormal"
          label="lowNormal"
          placeholder="lowNormal"
          margin="normal"
          onChange={this.handleChange}
        />
        <TextField
          type="number"
          id="highNormal"
          label="highNormal"
          placeholder="highNormal"
          margin="normal"
          onChange={this.handleChange}
        />
        <TextField
          type="string"
          id="unit"
          label="unit"
          placeholder="unit"
          margin="normal"
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

export default NumericDataType;
