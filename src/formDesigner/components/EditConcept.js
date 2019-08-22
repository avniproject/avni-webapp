import React, { Component } from "react";
import TextField from "@material-ui/core/TextField";
import axios from "axios";
import Button from "@material-ui/core/Button";
import { default as UUID } from "uuid";
import NumericDataType from "./NumericDataType";
import Grid from "@material-ui/core/Grid";
import CodedDataType from "./CodedDataType";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import FormHelperText from "@material-ui/core/FormHelperText";
import CustomizedSnackbar from "./CustomizedSnackbar";

class EditConcept extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      uuid: "",
      dataType: "",
      lowAbsolute: null,
      highAbsolute: null,
      lowNormal: null,
      highNormal: null,
      unit: "",
      answers: [],
      conceptCreationAlert: false,
      flag: false,
      absoluteValidation: false,
      normalValidation: false,
      error: {}
    };
  }

  componentDidMount() {
    axios
      .get("/web/concept/" + this.props.match.params.uuid)
      .then(response => {
        console.log("Response", response);
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

        console.log(answers);
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
  }

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

  postEditedData() {
    const absoluteValidation = parseInt(this.state.lowAbsolute) > parseInt(this.state.highAbsolute);
    const normalValidation = parseInt(this.state.lowNormal) > parseInt(this.state.highNormal);

    if (absoluteValidation || normalValidation) {
      this.setState({
        absoluteValidation: absoluteValidation,
        normalValidation: normalValidation
      });
    } else {
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
            unit: this.state.unit,
            answers: []
          }
        ])
        .then(response => {
          if (response.status === 200) {
            console.log(response);
            this.setState({
              name: "",
              dataType: "",
              lowAbsolute: null,
              highAbsolute: null,
              lowNormal: null,
              highNormal: null,
              unit: null,
              answers: [],
              conceptCreationAlert: true
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
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
        if (conceptExist.length !== 0 && conceptExist[0].uuid !== this.state.uuid) {
          error["nameError"] = true;
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
                      if (length === index) {
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
      this.postEditedData();
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    this.formValidation();
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

  onChangeAnswerName = (answerName, index) => {
    const answers = [...this.state.answers];
    answers[index].name = answerName;
    this.setState(
      {
        answers
      },
      () => {
        console.log(this.state.answers);
      }
    );
  };

  onToggleAnswerField = (event, index) => {
    const answers = [...this.state.answers];
    answers[index][event.target.id] = !answers[index][event.target.id];
    this.setState({
      answers
    });
  };

  onDeleteAnswer = index => {
    const answers = [...this.state.answers];
    if (answers[index].name !== "") {
      answers[index].voided = true;
      this.setState({
        answers
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
      }
    };

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
          onChangeAnswerName={this.onChangeAnswerName}
          onToggleAnswerField={this.onToggleAnswerField}
          onDeleteAnswer={this.onDeleteAnswer}
          onAddAnswer={this.onAddAnswer}
        />
      );
    }

    return (
      <ScreenWithAppBar appbarTitle={"Edit a Concept"} enableLeftMenuButton={true}>
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
              <TextField
                id="dataType"
                label="DataType"
                value={this.state.dataType}
                style={classes.select}
                disabled={true}
              />
            </Grid>
            {dataType}

            <Grid item sm={12}>
              <Button type="submit" variant="contained" color="primary" style={classes.button}>
                Submit
              </Button>
            </Grid>
          </Grid>

          {this.state.conceptCreationAlert && (
            <CustomizedSnackbar message="Concept updated successfully." />
          )}
        </form>
      </ScreenWithAppBar>
    );
  }
}

export default EditConcept;
