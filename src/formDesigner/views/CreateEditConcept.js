import React, { Component } from "react";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import http from "common/utils/httpClient";
import Button from "@material-ui/core/Button";
import { default as UUID } from "uuid";
import NumericConcept from "../components/NumericConcept";
import CodedConcept from "../components/CodedConcept";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import CustomizedSnackbar from "../components/CustomizedSnackbar";
import PropTypes from "prop-types";
import { DragDropContext } from "react-beautiful-dnd";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import KeyValues from "../components/KeyValues";
import { filter, trim } from "lodash";

class CreateEditConcept extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataTypes: [],
      name: "",
      uuid: "",
      dataType: "",
      lowAbsolute: null,
      highAbsolute: null,
      lowNormal: null,
      highNormal: null,
      unit: null,
      createdBy: "",
      lastModifiedBy: "",
      creationDateTime: "",
      lastModifiedDateTime: "",
      answers: [
        {
          name: "",
          uuid: "",
          unique: false,
          abnormal: false,
          editable: true,
          voided: false,
          order: 0,
          isEmptyAnswer: false
        }
      ],
      conceptCreationAlert: false,
      error: {},
      defaultSnackbarStatus: true,
      keyValues: []
    };
  }

  componentDidMount() {
    if (this.props.isCreatePage) {
      http
        .get("/concept/dataTypes")
        .then(response => {
          this.setState({
            dataTypes: response.data
          });
        })
        .catch(error => {
          console.log(error);
        });
    } else {
      http
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
            createdBy: response.data.createdBy,
            lastModifiedBy: response.data.lastModifiedBy,
            creationDateTime: response.data.createdDateTime,
            lastModifiedDateTime: response.data.lastModifiedDateTime,
            keyValues: response.data.keyValues,
            answers
          });
        })
        .catch(error => {
          console.log(error);
        });
    }
  }

  getDefaultSnackbarStatus = defaultSnackbarStatus => {
    this.setState({ defaultSnackbarStatus: defaultSnackbarStatus });
  };

  onDeleteAnswer = index => {
    const answers = [...this.state.answers];
    if (answers[index].name !== "") {
      answers[index].voided = true;
      const encodedURL = `/web/concept?name=${encodeURIComponent(answers[index].name)}`;

      http
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
        {
          name: "",
          uuid: "",
          unique: false,
          abnormal: false,
          editable: true,
          voided: false,
          order: 0,
          isEmptyAnswer: false
        }
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
    answers.map(function(answer, index) {
      return (answer.order = index);
    });

    this.setState(
      {
        answers: answers
      },
      () => {
        http
          .post("/concepts", [
            {
              name: this.state.name,
              uuid: this.props.isCreatePage ? UUID.v4() : this.state.uuid,
              dataType: this.state.dataType,
              keyValues: this.state.keyValues,
              answers: this.state.answers
            }
          ])
          .then(response => {
            if (response.status === 200) {
              this.setState({
                conceptCreationAlert: true,
                name: this.props.isCreatePage ? "" : this.state.name,
                uuid: this.props.isCreatePage ? "" : this.state.uuid,
                dataType: this.props.isCreatePage ? "" : this.state.dataType,
                keyValues: this.props.isCreatePage ? [] : this.state.keyValues,
                lowAbsolute: null,
                highAbsolute: null,
                lowNormal: null,
                highNormal: null,
                unit: null,
                answers: this.props.isCreatePage ? [] : this.state.answers,
                defaultSnackbarStatus: true
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
    const answers = this.state.answers;
    var promise = new Promise((resolve, reject) => {
      http
        .get(`/web/concept?name=${encodeURIComponent(conceptName)}`)
        .then(response => {
          if (response.status === 200 && this.props.isCreatePage) {
            error["nameError"] = true;
          }
          if (
            response.status === 200 &&
            response.data.uuid !== this.state.uuid &&
            !this.props.isCreatePage
          ) {
            error["nameError"] = true;
          }

          resolve("Promise resolved ");
        })
        .catch(error => {
          if (error.response.status === 404) {
            resolve("Promise resolved ");
          } else {
            reject(Error("Promise rejected"));
          }
        });
    });

    promise.then(
      result => {
        if (this.state.dataType === "") {
          error["dataTypeSelectionAlert"] = true;
        }
        if (this.state.name.trim() === "") {
          error["isEmptyName"] = true;
        }
        if (parseInt(this.state.lowAbsolute) > parseInt(this.state.highAbsolute)) {
          error["absoluteValidation"] = true;
        }
        if (parseInt(this.state.lowNormal) > parseInt(this.state.highNormal)) {
          error["normalValidation"] = true;
        }
        const emptyKeyValues = filter(
          this.state.keyValues,
          ({ key, value }) => key === "" || value === ""
        );
        if (emptyKeyValues.length > 0) {
          error["keyValueError"] = true;
        }

        this.state.dataType === "Coded" &&
          answers.forEach(answer => {
            if (answer.name.trim() === "") {
              answer["isEmptyAnswer"] = true;
              error["isEmptyAnswer"] = true;
            } else {
              answer["isEmptyAnswer"] = false;
            }
          });

        this.setState({
          error: error,
          answers: answers
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

  onDragEnd = result => {
    const { destination, source } = result;
    if (!destination) {
      return;
    }
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }
    const sourceElementIndex = result.draggableId.replace("Element", "");
    const destinationElementIndex = result.destination.index;
    const answers = [...this.state.answers];
    const answer = answers.splice(sourceElementIndex, 1);

    answers.splice(destinationElementIndex, 0, answer[0]);
    this.setState({
      answers
    });
  };

  afterSuccessfullValidation = () => {
    if (this.state.dataType === "Coded") {
      const answers = this.state.answers;
      const length = answers.length;

      let index = 0;
      if (length !== 0) {
        answers.forEach(answer => {
          return http
            .get(`/web/concept?name=${encodeURIComponent(answer.name)}`)
            .then(response => {
              if (response.status === 200) {
                answer.uuid = response.data.uuid;
                answer.keyValues = response.data.keyValues;
                index = index + 1;
                if (index === length) {
                  this.postCodedData(answers);
                }
              }
            })
            .catch(error => {
              if (error.response.status === 404) {
                answer.uuid = UUID.v4();
                http
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
              } else {
                console.log(error);
              }
            });
        });
      } else {
        this.postCodedData(answers);
      }
    } else {
      if (!this.state.error.absoluteValidation || !this.state.error.normalValidation) {
        http
          .post("/concepts", [
            {
              name: this.state.name,
              uuid: this.props.isCreatePage ? UUID.v4() : this.state.uuid,
              dataType: this.state.dataType,
              keyValues: this.state.keyValues,
              lowAbsolute: this.state.lowAbsolute,
              highAbsolute: this.state.highAbsolute,
              lowNormal: this.state.lowNormal,
              highNormal: this.state.highNormal,
              unit: this.state.unit === "" ? null : this.state.unit
            }
          ])
          .then(response => {
            if (response.status === 200) {
              this.setState({
                conceptCreationAlert: true,
                defaultSnackbarStatus: true,
                name: this.props.isCreatePage ? "" : this.state.name,
                uuid: this.props.isCreatePage ? "" : this.state.uuid,
                dataType: this.props.isCreatePage ? "" : this.state.dataType,
                keyValues: this.props.isCreatePage ? [] : this.state.keyValues,
                lowAbsolute: this.props.isCreatePage ? "" : this.state.lowAbsolute,
                highAbsolute: this.props.isCreatePage ? "" : this.state.highAbsolute,
                lowNormal: this.props.isCreatePage ? "" : this.state.lowNormal,
                highNormal: this.props.isCreatePage ? "" : this.state.highNormal,
                unit: this.props.isCreatePage ? "" : this.state.unit
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

  castValueToBooleanOrInt = ({ key, value }) => {
    let castedValue;
    try {
      castedValue = JSON.parse(value.toLowerCase());
    } catch (e) {
      castedValue = trim(value);
    }
    return { key: trim(key), value: castedValue };
  };

  onKeyValueChange = (keyValue, index) => {
    const keyValues = this.state.keyValues;
    keyValues[index] = this.castValueToBooleanOrInt(keyValue);
    this.setState({ ...this.state, keyValues });
  };

  onAddNewKeyValue = () => {
    const keyValues = this.state.keyValues || [];
    keyValues.push({ key: "", value: "" });
    this.setState({ ...this.state, keyValues });
  };

  onDeleteKeyValue = index => {
    const keyValues = this.state.keyValues;
    keyValues.splice(index, 1);
    this.setState({ ...this.state, keyValues });
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
      },
      inputLabel: {
        marginTop: 15,
        fontSize: 16
      }
    };

    const conceptCreationMessage = this.props.isCreatePage
      ? "Concept created successfully."
      : "Concept updated successfully.";

    const appBarTitle = this.props.isCreatePage ? "Create a Concept" : "Edit a Concept";

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
        <DragDropContext onDragEnd={this.onDragEnd}>
          <CodedConcept
            answers={this.state.answers}
            onDeleteAnswer={this.onDeleteAnswer}
            onAddAnswer={this.onAddAnswer}
            onChangeAnswerName={this.onChangeAnswerName}
            onToggleAnswerField={this.onToggleAnswerField}
          />
        </DragDropContext>
      );
    }

    return (
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title={appBarTitle} />
        <Grid container justify="flex-start">
          <Grid item sm={12}>
            <TextField
              id="name"
              label="Concept name"
              value={this.state.name}
              onChange={this.handleChange("name")}
              style={classes.textField}
              margin="normal"
              autoComplete="off"
            />
            {this.state.error.isEmptyName && <FormHelperText error>*Required.</FormHelperText>}
            {!this.state.error.isEmptyName &&
              (this.state.error.nameError && (
                <FormHelperText error>Same name concept already exist.</FormHelperText>
              ))}
          </Grid>

          <Grid item sm={3}>
            {this.props.isCreatePage && (
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
            {!this.props.isCreatePage && (
              <TextField
                id="dataType"
                label="DataType"
                value={this.state.dataType}
                style={classes.select}
                disabled={true}
              />
            )}
          </Grid>
          <Grid item sm={8} />
          {dataType}
        </Grid>
        <KeyValues
          keyValues={this.state.keyValues}
          onKeyValueChange={this.onKeyValueChange}
          onAddNewKeyValue={this.onAddNewKeyValue}
          onDeleteKeyValue={this.onDeleteKeyValue}
          error={this.state.error.keyValueError}
        />
        <Grid>
          <Button
            type="button"
            color="primary"
            variant="contained"
            style={classes.button}
            onClick={this.handleSubmit}
          >
            Submit
          </Button>
        </Grid>

        {!this.props.isCreatePage && (
          <div style={{ marginTop: "50px" }}>
            <InputLabel style={classes.inputLabel}>Created by </InputLabel>
            {this.state.createdBy}

            <InputLabel style={classes.inputLabel}>Last modified by </InputLabel>
            {this.state.lastModifiedBy}

            <InputLabel style={classes.inputLabel}>Creation datetime </InputLabel>
            {this.state.creationDateTime}

            <InputLabel style={classes.inputLabel}>Last modified datetime </InputLabel>
            {this.state.lastModifiedDateTime}
          </div>
        )}

        {this.state.conceptCreationAlert && (
          <CustomizedSnackbar
            message={conceptCreationMessage}
            getDefaultSnackbarStatus={this.getDefaultSnackbarStatus}
            defaultSnackbarStatus={this.state.defaultSnackbarStatus}
          />
        )}
      </Box>
    );
  }
}

CreateEditConcept.propTypes = { isCreatePage: PropTypes.bool };
CreateEditConcept.defaultProps = { isCreatePage: false, enableLeftMenuButton: true };
export default CreateEditConcept;
