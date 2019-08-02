import React, { Component } from "react";
import ButtonAppBar from "./CommonHeader";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import axios from "axios";
import Button from "@material-ui/core/Button";
import { default as UUID } from "uuid";
import NumericDataType from "./NumericDataType";

class CreateConcept extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataTypes: [],
      flag: true,
      name: "",
      dataType: "",
      lowAbsolute: null,
      highAbsolute: null,
      lowNormal: null,
      highNormal: null,
      unit: null
    };
  }

  componentDidMount() {
    axios
      .get("/concept/dataTypes")
      .then(response => {
        this.setState({
          dataTypes: response.data
        });
      })
      .catch(error => {
        console.log(error);
      });
  }

  handleChange = stateHandler => e => {
    this.setState({
      [stateHandler]: e.target.value
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    if (this.state.dataType === "Coded") {
      console.log(" Coded requires more attention.");
    } else {
      axios
        .post("/concepts", [
          {
            name: this.state.name,
            uuid: UUID.v4(),
            dataType: this.state.dataType,
            lowAbsolute: this.state.lowAbsolute,
            highAbsolute: this.state.highAbsolute,
            lowNormal: this.state.lowNormal,
            highNormal: this.state.highNormal,
            unit: this.state.unit
          }
        ])
        .then(response => {
          if (response.status === 200) {
            console.log(response);
          }
        });
    }
  };

  getValue = (id, value) => {
    this.setState({
      [id]: value
    });
  };

  render() {
    let numericDataType;
    if (this.state.dataType === "Numeric") {
      numericDataType = <NumericDataType sendValue={this.getValue} />;
    }
    return (
      <div>
        <ButtonAppBar title="Create a Concept" />
        <form onSubmit={this.handleSubmit}>
          <TextField
            required
            id="name"
            label="Name"
            // className={classes.textField}
            value={this.state.name}
            onChange={this.handleChange("name")}
            margin="normal"
            variant="outlined"
          />
          <br />
          {/* <InputLabel htmlFor="age-required">DataType</InputLabel> */}
          <br />
          <InputLabel htmlFor="age-helper">Age</InputLabel>
          <Select
            id="dataType"
            label="DataType"
            value={this.state.dataType}
            onChange={this.handleChange("dataType")}
            input={
              <OutlinedInput labelWidth={60} name="dataType" id="dataType" />
            }
          >
            {this.state.dataTypes.map(datatype => {
              return (
                <MenuItem value={datatype} key={datatype}>
                  {datatype}
                </MenuItem>
              );
            })}
          </Select>
          {numericDataType}
          <Button type="submit" variant="outlined" color="primary">
            Submit
          </Button>
        </form>
      </div>
    );
  }
}

export default CreateConcept;
