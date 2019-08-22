import React, { Component } from "react";
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
import FormHelperText from "@material-ui/core/FormHelperText";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import CustomizedSnackbar from "./CustomizedSnackbar";

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
      answers: [
        { name: "", uuid: "", unique: false, abnormal: false, editable: true, voided: false }
      ],
      conceptCreationAlert: false,
      absoluteValidation: false,
      normalValidation: false,
      error: {}
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
    answers[index].voided = true;
    this.setState({
      answers
    });
  };

  onAddAnswer = () => {
    this.setState({
      answers: [
        ...this.state.answers,
        { name: "", uuid: "", unique: false, abnormal: false, editable: true, voided: false }
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

  formValidation = () => {
    const conceptName = this.state.name;
    let error = {};
    axios
      .get("/search/concept?name=" + conceptName)
      .then(response => {
        const conceptExist = response.data.filter(
          item => item.name.toLowerCase().trim() === conceptName.toLowerCase().trim()
        );
        if (conceptExist.length !== 0) {
          error["nameError"] = true;
        }
        if (this.state.dataType === "") {
          error["dataTypeSelectionAlert"] = true;
        }
        this.setState({
          error: error
        });
        Object.keys(error).length === 0 && this.afterSuccessfullValidation();
      })
      .catch(error => {
        console.log(error);
      });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.formValidation();
  };

  afterSuccessfullValidation = e => {
    if (this.state.dataType === "Coded") {
      const answers = this.state.answers;
      const length = answers.length;

      let index = 0;
      answers.map(answer => {
        return axios
          .get("/search/concept?name=" + answer.name)
          .then(response => {
            console.log("Response", response.data);
            const result = response.data.filter(
              item => item.name.toLowerCase().trim() === answer.name.toLowerCase().trim()
            );

            if (result.length !== 0) {
              answer.uuid = result[0].uuid;

              index = index + 1;
              if (index === length) {
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
                    if (index === length) {
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
      const absoluteValidation =
        parseInt(this.state.lowAbsolute) > parseInt(this.state.highAbsolute);
      const normalValidation = parseInt(this.state.lowNormal) > parseInt(this.state.highNormal);
      if (absoluteValidation || normalValidation) {
        this.setState({
          normalValidation: normalValidation,
          absoluteValidation: absoluteValidation
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
              unit: this.state.unit,
              absoluteValidation: false,
              normalValidation: false
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
        marginTop: 40
      },
      inputLabel: {
        marginTop: 15
      }
    };

    return (
      <div>
        <ScreenWithAppBar appbarTitle={"Create a Concept"} enableLeftMenuButton={true}>
          <form onSubmit={this.handleSubmit}>
            <Grid container justify="flex-start">
              <Grid item sm={12}>
                <TextField
                  required
                  id="name"
                  label="Name"
                  value={this.state.name}
                  onChange={this.handleChange("name")}
                  style={classes.textField}
                  margin="normal"
                />
                {this.state.error.nameError && (
                  <FormHelperText error>Same name concept already exist.</FormHelperText>
                )}
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
                  {this.state.error.dataTypeSelectionAlert && (
                    <FormHelperText error>*Required</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              {dataType}
            </Grid>
            <Grid>
              <Button type="submit" color="primary" variant="contained" style={classes.button}>
                Submit
              </Button>
            </Grid>

            {this.state.conceptCreationAlert && (
              <CustomizedSnackbar message="Concept created successfully." />
            )}
          </form>
        </ScreenWithAppBar>
      </div>
    );
  }
}

export default CreateConcept;
