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
import CodedDataType from "./CodedDataType";
import Grid from "@material-ui/core/Grid";

class CreateConcept extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataTypes: [],
      name: "",
      dataType: "",
      lowAbsolute: null,
      highAbsolute: null,
      lowNormal: null,
      highNormal: null,
      unit: null,
      answers: []
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

  postCodedData(tempAnswers) {
    this.setState(
      {
        answers: tempAnswers
      },
      () => {
        axios
          .post("/concepts", [
            {
              name: this.state.name,
              uuid: UUID.v4(),
              dataType: this.state.dataType,
              answers: this.state.answers
            }
          ])
          .then(response => {
            if (response.status === 200) {
              console.log(response);
            }
          })
          .catch(error => {
            console.log("Error::", error);
          });
      }
    );
  }

  handleSubmit = e => {
    e.preventDefault();
    if (this.state.dataType === "Coded") {
      const tempAnswers = this.state.answers;
      const len = tempAnswers.length;

      tempAnswers.map((name, index) => {
        axios
          .get("/search/concept?name=" + name.answer + "&dataType=NA")
          .then(response => {
            const result = response.data.filter(
              item => item.name === name.answer
            );
            if (result.length == 1) {
              name.uuid = result[0].uuid;
              if (len - 1 == index) {
                this.postCodedData(tempAnswers);
              }
            } else {
              name.uuid = UUID.v4();
              axios
                .post("/concepts", [
                  {
                    name: name.answer,
                    uuid: name.uuid,
                    dataType: "NA",
                    lowAbsolute: null,
                    highAbsolute: null,
                    lowNormal: null,
                    highNormal: null,
                    unit: null
                  }
                ])
                .then(response => {
                  if (response.status === 200) {
                    console.log(
                      "Dynamic concept added through Coded",
                      response
                    );
                    if (len - 1 == index) {
                      this.postCodedData(tempAnswers);
                    }
                  }
                });
            }
          })
          .catch(error => {
            console.log("CAT", error);
          });
      });
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
            console.log("Response:::", response);
          }
        })
        .catch(err => {
          console.log("ERRRR:::::", err);
        });
    }
  };

  getValue = (id, value) => {
    this.setState({
      [id]: value
    });
  };

  getCodedValue = value => {
    this.setState({
      answers: value
    });
  };

  render() {
    let dataType;
    if (this.state.dataType === "Numeric") {
      dataType = <NumericDataType sendValue={this.getValue} />;
    }
    if (this.state.dataType === "Coded") {
      dataType = <CodedDataType sendValue={this.getCodedValue} />;
    }
    return (
      <>
        <ButtonAppBar title="Create a Concept" />
        <Grid container justify="center">
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
            <InputLabel htmlFor="age-helper">Datatype</InputLabel>
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

            {dataType}
            <div>
              <Button type="submit" variant="outlined" color="primary">
                Submit
              </Button>
            </div>
          </form>
        </Grid>
      </>
    );
  }
}

export default CreateConcept;
