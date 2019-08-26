import React, { Component } from "react";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import axios from "axios";
import Button from "@material-ui/core/Button";
import { default as UUID } from "uuid";
import NumericConcept from "./NumericDataType";
import CodedConcept from "./CodedDataType";
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
      uuid: UUID.v4(),
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
      error: {},
      createPage: false
    };
  }

  componentDidMount() {
    if (this.props.match.params.uuid) {
      axios
        .get("/web/concept/" + this.props.match.params.uuid)
        .then(response => {
          let answers = [];
          if (response.data.dataType === "Coded" && response.data.conceptAnswers) {
            answers = response.data.conceptAnswers.map(conceptAnswer => ({
              name: conceptAnswer.answerConcept.name,
              uuid: conceptAnswer.answerConcept.uuid,
              unique: conceptAnswer.unique,
              abnormal: conceptAnswer.abnormal,
              order: conceptAnswer.order,
              voided: conceptAnswer.voided
            }));
            answers.sort(function(conceptOrder1, conceptOrder2) {
              return conceptOrder1.order - conceptOrder2.order;
            });
          }

          this.setState({
            name: response.data.name,
            uuid: response.data.uuid,
            dataType: response.data.dataType,
            lowAbsolute: response.data.lowAbsolute,
            highAbsolute: response.data.highAbsolute,
            lowNormal: response.data.lowNormal,
            highNormal: response.data.highNormal,
            unit: response.data.unit,
            answers
          });
        })
        .catch(error => {
          console.log(error);
        });
    } else {
      this.setState({
        createPage: true
      });
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
  }

  onDeleteAnswer = index => {
    const answers = [...this.state.answers];
    if (answers[index].name !== "") {
      answers[index].voided = true;
      const encodedURL =
        "/concept/search/findByName?name=" + encodeURIComponent(answers[index].name);
      axios
        .get(encodedURL)
        .then(response => {
          this.setState({
            answers
          });
        })
        .catch(error => {
          answers.splice(index, 1);
          this.setState({
            answers
          });
        });
    } else {
      answers.splice(index, 1);
      this.setState({
        answers
      });
    }
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
              uuid: this.state.uuid,
              dataType: this.state.dataType,
              answers: this.state.answers
            }
          ])
          .then(response => {
            if (response.status === 200) {
              this.setState({
                conceptCreationAlert: true,
                name: "",
                uuid: "",
                dataType: "",
                lowAbsolute: null,
                highAbsolute: null,
                lowNormal: null,
                highNormal: null,
                unit: null,
                answers: []
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
    var promise = new Promise((resolve, reject) => {
      axios
        .get("/search/concept?name=" + conceptName)
        .then(response => {
          const conceptExist = response.data.filter(
            item => item.name.toLowerCase().trim() === conceptName.toLowerCase().trim()
          );

          if (conceptExist.length !== 0 && this.state.createPage === true) {
            error["nameError"] = true;
          } else if (
            conceptExist.length !== 0 &&
            conceptExist[0].uuid !== this.state.uuid &&
            this.state.createPage === false
          ) {
            error["nameError"] = true;
          }

          resolve("Promise resolved ");
        })
        .catch(error => {
          console.log(error);
          reject(Error("Promise rejected"));
        });
    });

    promise.then(
      result => {
        if (this.state.dataType === "") {
          error["dataTypeSelectionAlert"] = true;
        }
        if (parseInt(this.state.lowAbsolute) > parseInt(this.state.highAbsolute)) {
          error["absoluteValidation"] = true;
        }
        if (parseInt(this.state.lowNormal) > parseInt(this.state.highNormal)) {
          error["normalValidation"] = true;
        }

        this.setState({
          error
        });

        Object.keys(error).length === 0 && this.afterSuccessfullValidation();
      },
      function(error) {
        console.log(error);
      }
    );
  };

  handleSubmit = e => {
    e.preventDefault();

    this.formValidation();
  };

  afterSuccessfullValidation = () => {
    if (this.state.dataType === "Coded") {
      const answers = this.state.answers;
      const length = answers.length;

      let index = 0;
      if (length !== 0) {
        answers.map(answer => {
          return axios
            .get("/search/concept?name=" + answer.name)
            .then(response => {
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
        this.postCodedData(answers);
      }
    } else {
      if (!this.state.error.absoluteValidation || !this.state.error.normalValidation) {
        axios
          .post("/concepts", [
            {
              name: this.state.name,
              uuid: this.state.uuid,
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
            }
          })
          .catch(error => {
            console.log(error);
          });
      }
    }
  };
  onNumericConceptAttributeAssignment = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };

  onAppbarTitle() {
    if (this.state.createPage === true) {
      return "Create a Concept";
    } else {
      return "Edit a Concept";
    }
  }
  onConceptCreationMessage() {
    if (this.state.createPage === true) {
      return "Concept created successfully.";
    } else {
      return "Concept updated successfully.";
    }
  }

  render() {
    let dataType;
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

    if (this.state.dataType === "Numeric") {
      dataType = (
        <NumericConcept
          onNumericConceptAttributeAssignment={this.onNumericConceptAttributeAssignment}
          numericDataTypeAttributes={this.state}
        />
      );
    }
    if (this.state.dataType === "Coded") {
      dataType = (
        <CodedConcept
          answers={this.state.answers}
          onDeleteAnswer={this.onDeleteAnswer}
          onAddAnswer={this.onAddAnswer}
          onChangeAnswerName={this.onChangeAnswerName}
          onToggleAnswerField={this.onToggleAnswerField}
        />
      );
    }

    return (
      <ScreenWithAppBar appbarTitle={this.onAppbarTitle()} enableLeftMenuButton={true}>
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
              {this.state.createPage && (
                <FormControl>
                  <InputLabel style={classes.inputLabel}>Datatype *</InputLabel>
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
              )}
              {!this.state.createPage && (
                <TextField
                  id="dataType"
                  label="DataType"
                  value={this.state.dataType}
                  style={classes.select}
                  disabled={true}
                />
              )}
            </Grid>
            {dataType}
          </Grid>

          <Grid>
            <Button type="submit" color="primary" variant="contained" style={classes.button}>
              Submit
            </Button>
          </Grid>

          {this.state.conceptCreationAlert && (
            <CustomizedSnackbar message={this.onConceptCreationMessage()} />
          )}
        </form>
      </ScreenWithAppBar>
    );
  }
}

export default CreateConcept;
