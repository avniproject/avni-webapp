import React, { Component } from "react";
import ButtonAppBar from "./CommonHeader";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import axios from "axios";
import Button from "@material-ui/core/Button";
import { default as UUID } from "uuid";
import NumericDataType from "./NumericDataType";
import CodedDataType from "./CodedDataType";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import CustomizedDialogs from "./CustomizedDialogs";
import FormHelperText from "@material-ui/core/FormHelperText";
import { LineBreak } from "../../common/components";

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
      answers: [{ name: "", uuid: "", unique: false, abnormal: false, editable: true }],
      conceptCreationAlert: false,
      dataTypeSelectionAlert: false
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

  onDeleteAnswer = index => {
    const answers = [...this.state.answers];
    answers.splice(index, 1);
    answers.indexOf(answers[index], 1);
    this.setState({
      answers
    });
  };

  onAddAnswer = () => {
    this.setState({
      answers: [
        ...this.state.answers,
        { name: "", uuid: "", unique: false, abnormal: false, editable: true }
      ]
    });
  };

  onChangeAnswerName = (answerName, index) => {
    const answers = [...this.state.answers];
    answers[index].name = answerName;
    this.setState({
      answers
    });
  };

  onToggleAnswerField = (event, index) => {
    const answers = [...this.state.answers];
    answers[index][event.target.id] = !answers[index][event.target.id];
    this.setState({
      answers
    });
  };

  handleChange = stateHandler => e => {
    this.setState({
      [stateHandler]: e.target.value
    });
  };

  postCodedData(answers) {
    this.setState(
      {
        answers: answers
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
              this.setState({
                conceptCreationAlert: true
              });
            } else {
              this.setState({
                errorAlert: true
              });
            }
          })
          .catch(error => {
            console.log(error);
          });
      }
    );
  }

  handleSubmit = e => {
    e.preventDefault();
    if (this.state.dataType === "") {
      this.setState({
        dataTypeSelectionAlert: true
      });
    } else {
      if (this.state.dataType === "Coded") {
        const answers = this.state.answers;
        const length = answers.length;

        let index = 0;
        answers.map(answer => {
          axios
            .get("/search/concept?name=" + answer.name + "&dataType=NA")
            .then(response => {
              console.log("Response", response.data);
              const result = response.data.filter(
                item => item.name.toLowerCase().trim() === answer.name.toLowerCase().trim()
              );

              if (result.length !== 0) {
                answer.uuid = result[0].uuid;

                index = index + 1;
                if (index == length) {
                  this.postCodedData(answers);
                }
              } else {
                answer.uuid = UUID.v4();
                axios
                  .post("/concepts", [
                    {
                      name: answer.name,
                      uuid: answer.uuid,
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
                      console.log("Dynamic concept added through Coded", response);

                      index = index + 1;
                      if (index == length) {
                        this.postCodedData(answers);
                      }
                    }
                  });
              }
            })
            .catch(error => {
              console.log(error);
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
              console.log(response);
              this.setState({
                conceptCreationAlert: true
              });
            } else {
              this.setState({
                errorAlert: true
              });
            }
          })
          .catch(error => {
            console.log(error);
          });
      }
    }
  };

  onNumericDataType = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };

  getDialogFlag = value => {
    this.setState({
      conceptCreationAlert: !value
      // errorAlert: !value
    });
  };

  render() {
    let dataType;
    if (this.state.dataType === "Numeric") {
      dataType = (
        <NumericDataType
          onNumericDataType={this.onNumericDataType}
          numericDataTypeProperties={this.state}
        />
      );
    }
    if (this.state.dataType === "Coded") {
      dataType = (
        <CodedDataType
          answers={this.state.answers}
          onDeleteAnswer={this.onDeleteAnswer}
          onAddAnswer={this.onAddAnswer}
          onChangeAnswerName={this.onChangeAnswerName}
          onToggleAnswerField={this.onToggleAnswerField}
          // onAutoSuggestChange={this.onAutoSuggestChange}
        />
      );
    }

    const classes = {
      textField: {
        width: 400,
        marginRight: 10
      },
      select: {
        width: 400,
        height: 40,
        marginTop: 24
      },
      button: {
        // justifyContent: "center",
        variant: "contained",
        marginTop: 40
      },
      inputLabel: {
        marginTop: 15
      }
    };

    return (
      <>
        <ButtonAppBar title="Create a Concept" />

        <form onSubmit={this.handleSubmit}>
          <Grid container justify="flex-start">
            <Grid sm={12}>
              <TextField
                required
                id="name"
                label="Name"
                value={this.state.name}
                onChange={this.handleChange("name")}
                style={classes.textField}
                margin="normal"
              />
            </Grid>

            <Grid>
              <FormControl>
                <InputLabel htmlFor="age-helper" style={classes.inputLabel}>
                  Datatype *
                </InputLabel>
                <Select
                  id="dataType"
                  label="DataType"
                  value={this.state.dataType}
                  onChange={this.handleChange("dataType")}
                  style={classes.select}
                >
                  {this.state.dataTypes.map(datatype => {
                    return (
                      <MenuItem value={datatype} key={datatype}>
                        {datatype}
                      </MenuItem>
                    );
                  })}
                </Select>
                {this.state.dataTypeSelectionAlert && (
                  <FormHelperText error>*Required</FormHelperText>
                )}
              </FormControl>
            </Grid>
            {dataType}
          </Grid>
          <Grid>
            <Button type="submit" color="primary" style={classes.button}>
              Submit
            </Button>
          </Grid>

          {this.state.conceptCreationAlert && (
            <CustomizedDialogs
              sendValue={this.getDialogFlag}
              message="Concept created successfully."
            />
          )}
        </form>
      </>
    );
  }
}

export default CreateConcept;
