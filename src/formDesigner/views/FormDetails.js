import React, { Component } from "react";
import PropTypes from "prop-types";
import _, { cloneDeep, isEmpty } from "lodash";
import http from "common/utils/httpClient";
import Grid from "@material-ui/core/Grid";
import FormElementGroup from "../components/FormElementGroup";
import Button from "@material-ui/core/Button";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import { default as UUID } from "uuid";
import SaveIcon from "@material-ui/icons/Save";
import CustomizedSnackbar from "../components/CustomizedSnackbar";
import { FormControl } from "@material-ui/core";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import produce from "immer";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import InputLabel from "@material-ui/core/InputLabel";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";

import FormLevelRules from "../components/FormLevelRules";

export const isNumeric = concept => concept.dataType === "Numeric";

export const isText = concept => concept.dataType === "Text";

export const areValidFormatValuesValid = formElement => {
  if (!isNumeric(formElement.concept) && !isText(formElement.concept)) return true;
  if (!formElement.validFormat) return true;
  const result =
    isEmpty(formElement.validFormat.regex) === isEmpty(formElement.validFormat.descriptionKey);
  return result;
};

function TabContainer(props) {
  const typographyCSS = { padding: 8 * 3 };
  return (
    <Typography {...props} component="div" style={typographyCSS}>
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired
};

class FormDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form: [],
      identifierSource: [],
      name: "",
      errorMsg: "",
      saveCall: false,
      createFlag: true,
      activeTabIndex: 0,
      successAlert: false,
      defaultSnackbarStatus: true,
      detectBrowserCloseEvent: false,
      nameError: false
    };
    this.btnGroupClick = this.btnGroupClick.bind(this);
    this.deleteGroup = this.deleteGroup.bind(this);
    this.btnGroupAdd = this.btnGroupAdd.bind(this);
    this.handleGroupElementChange = this.handleGroupElementChange.bind(this);
    this.handleGroupElementKeyValueChange = this.handleGroupElementKeyValueChange.bind(this);
    this.handleExcludedAnswers = this.handleExcludedAnswers.bind(this);
    this.updateConceptElementData = this.updateConceptElementData.bind(this);
    this.handleModeForDate = this.handleModeForDate.bind(this);
    this.handleRegex = this.handleRegex.bind(this);
    this.validateForm = this.validateForm.bind(this);
  }

  onUpdateFormName = name => {
    // this function is because of we are using name in this component.
    this.setState({ name: name, detectBrowserCloseEvent: true });
  };

  onTabHandleChange = (event, value) => {
    this.setState({ activeTabIndex: value });
  };

  getDefaultSnackbarStatus = defaultSnackbarStatus => {
    this.setState({ defaultSnackbarStatus: defaultSnackbarStatus });
  };

  setupBeforeUnloadListener = () => {
    window.addEventListener("beforeunload", ev => {
      ev.preventDefault();
      this.state.detectBrowserCloseEvent && (ev.returnValue = "Are you sure you want to close?");
    });
  };

  componentDidMount() {
    this.setupBeforeUnloadListener();
    http.get(`/web/identifierSource`).then(response => {
      const identifierSources = [];
      if (response.data["_embedded"]) {
        _.forEach(response.data["_embedded"]["identifierSource"], (source, index) => {
          identifierSources.push({ value: source.uuid, label: source.name });
        });
      }
      this.setState({ identifierSource: identifierSources });
    });

    return http
      .get(`/forms/export?formUUID=${this.props.match.params.formUUID}`)
      .then(response => response.data)
      .then(form => {
        /*
        
        Below visitScheduleRule, decisionRule, validationRule are for handling form level rules and
        decisionExpand, visitScheduleExpand, validationExpand are for handling expand button.

        */
        form["visitScheduleRule"] = form.visitScheduleRule ? form.visitScheduleRule : "";
        form["decisionRule"] = form.decisionRule ? form.decisionRule : "";
        form["validationRule"] = form.validationRule ? form.validationRule : "";
        form["checklistsRule"] = form.checklistsRule ? form.checklistsRule : "";
        form["decisionExpand"] = false;
        form["visitScheduleExpand"] = false;
        form["validationExpand"] = false;
        form["checklistExpand"] = false;

        _.forEach(form.formElementGroups, group => {
          group.groupId = (group.groupId || group.name).replace(/[^a-zA-Z0-9]/g, "_");
          group.expanded = false;
          group.error = false;
          group.formElements.forEach(fe => {
            fe.expanded = false;
            fe.error = false;
            fe.showDateOrDuration = "durationOptions";
            //             if (fe["rule"]) {
            //               let ruleExtraction = fe["rule"];
            //               ruleExtraction = ruleExtraction.replace(
            //                 `'use strict';
            // function rule(params, imports) {`,
            //                 ""
            //               );

            //               ruleExtraction = ruleExtraction.replace(
            //                 `};
            // rule;`,
            //                 ""
            //               );
            //               fe["rule"] = ruleExtraction;
            //             }

            let keyValueObject = {};

            fe.keyValues.map(keyValue => {
              if (keyValue.key === "datePickerMode") fe.showDateOrDuration = "datePickerMode";
              return (keyValueObject[keyValue.key] = keyValue.value);
            });

            // "Date", "Duration"
            if (["Date", "Duration"].includes(fe.concept.dataType)) {
              if (!Object.keys(keyValueObject).includes("durationOptions")) {
                keyValueObject["durationOptions"] = [];
              }
            }
            if (
              fe.concept.dataType === "Coded" &&
              keyValueObject["ExcludedAnswers"] !== undefined
            ) {
              _.forEach(fe.concept.answers, answer => {
                if (keyValueObject["ExcludedAnswers"].includes(answer.name) && !answer.voided) {
                  answer["excluded"] = true;
                }
              });
            }

            fe.keyValues = keyValueObject;
          });
        });
        let dataGroupFlag = this.countGroupElements(form);
        this.setState({ form: form, name: form.name, createFlag: dataGroupFlag, dataLoaded: true });
        if (dataGroupFlag) {
          this.btnGroupClick();
        }
      })
      .catch(error => {
        console.log(error);
      });
  }
  countGroupElements(form) {
    let groupFlag = true;
    _.forEach(form.formElementGroups, (groupElement, index) => {
      if (!groupElement.voided) {
        groupFlag = false;
      }
    });
    return groupFlag;
  }

  reOrderSequence(form, index = -1) {
    if (index <= -1) {
      _.forEach(form.formElementGroups, (group, ind) => {
        group.displayOrder = ind + 1;
      });
    } else {
      _.forEach(form.formElementGroups[index].formElements, (element, ind) => {
        element.displayOrder = ind + 1;
      });
    }
  }

  // Group level events
  deleteGroup(index, elementIndex = -1) {
    if (elementIndex === -1) {
      this.setState(
        produce(draft => {
          let form = draft.form;
          if (form.formElementGroups[index].newFlag === "true") {
            form.formElementGroups.splice(index, 1);
          } else {
            form.formElementGroups[index].voided = true;
            _.forEach(form.formElementGroups[index].formElements, (group, index) => {
              group.voided = true;
            });
          }
          draft.createFlag = this.countGroupElements(form);
          draft.detectBrowserCloseEvent = true;
        })
      );
    } else {
      this.setState(
        produce(draft => {
          let form = draft.form;
          if (form.formElementGroups[index].formElements[elementIndex].newFlag === "true") {
            form.formElementGroups[index].formElements.splice(elementIndex, 1);
          } else {
            form.formElementGroups[index].formElements[elementIndex].voided = true;
          }

          draft.detectBrowserCloseEvent = true;
        })
      );
    }
  }

  handleRegex(index, propertyName, value, elementIndex) {
    this.setState(
      produce(draft => {
        value === "no" &&
          delete draft.form.formElementGroups[index].formElements[elementIndex].validFormat;

        draft.form.formElementGroups[index].formElements[elementIndex][propertyName] = value;
      })
    );
  }

  handleModeForDate(index, propertyName, value, elementIndex) {
    this.setState(
      produce(draft => {
        value === "durationOptions"
          ? delete draft.form.formElementGroups[index].formElements[elementIndex].keyValues[
              "datePickerMode"
            ]
          : delete draft.form.formElementGroups[index].formElements[elementIndex].keyValues[
              "durationOptions"
            ];

        draft.form.formElementGroups[index].formElements[elementIndex][propertyName] = value;
      })
    );
  }

  updateConceptElementData(index, propertyName, value, elementIndex = -1) {
    this.setState(
      produce(draft => {
        draft.form.formElementGroups[index].formElements[elementIndex]["concept"][
          propertyName
        ] = value;
      })
    );
  }

  updateSkipLogicRule = (index, elementIndex, value) => {
    this.setState(
      produce(draft => {
        draft.form.formElementGroups[index].formElements[elementIndex]["rule"] = value;
        draft.detectBrowserCloseEvent = true;
      })
    );
  };

  onUpdateDragDropOrder = (
    groupSourceIndex,
    sourceElementIndex,
    destinationElementIndex,
    groupOrElement = 1,
    groupDestinationIndex
  ) => {
    if (groupOrElement === 1) {
      let counter = 0;
      this.setState(
        produce(draft => {
          if (groupSourceIndex !== groupDestinationIndex) {
            let form = draft.form;
            const sourceElement = cloneDeep(
              form.formElementGroups[groupSourceIndex].formElements[sourceElementIndex]
            );
            sourceElement.uuid = UUID.v4();
            form.formElementGroups[groupDestinationIndex].formElements.forEach((element, index) => {
              if (!element.voided) {
                counter += 1;
                if (counter === destinationElementIndex) {
                  form.formElementGroups[groupDestinationIndex].formElements.splice(
                    index + 1,
                    0,
                    sourceElement
                  );
                }
              }
            });

            form.formElementGroups[groupSourceIndex].formElements[sourceElementIndex].voided = true;
          } else {
            let form = draft.form;

            form.formElementGroups[groupSourceIndex].formElements.forEach((element, index) => {
              if (!element.voided) {
                if (counter === destinationElementIndex) {
                  const sourceElement = form.formElementGroups[
                    groupSourceIndex
                  ].formElements.splice(sourceElementIndex, 1)[0];
                  form.formElementGroups[groupSourceIndex].formElements.splice(
                    index,
                    0,
                    sourceElement
                  );
                }
                counter += 1;
              }
            });
          }

          draft.detectBrowserCloseEvent = true;
        })
      );
    } else {
      let counter = 0;
      this.setState(
        produce(draft => {
          let form = draft.form;

          form.formElementGroups.forEach((element, index) => {
            if (!element.voided) {
              if (counter === destinationElementIndex) {
                const sourceElement = form.formElementGroups.splice(sourceElementIndex, 1)[0];
                form.formElementGroups.splice(index, 0, sourceElement);
              }
              counter += 1;
            }
          });
          draft.detectBrowserCloseEvent = true;
        })
      );
    }
  };

  renderGroups() {
    const formElements = [];
    _.forEach(this.state.form.formElementGroups, (group, index) => {
      if (!group.voided) {
        let propsGroup = {
          updateConceptElementData: this.updateConceptElementData,
          key: "Group" + index,
          groupData: group,
          index: index,
          deleteGroup: this.deleteGroup,
          btnGroupAdd: this.btnGroupAdd,
          identifierSource: this.state.identifierSource,
          onUpdateDragDropOrder: this.onUpdateDragDropOrder,
          handleGroupElementChange: this.handleGroupElementChange,
          handleGroupElementKeyValueChange: this.handleGroupElementKeyValueChange,
          handleExcludedAnswers: this.handleExcludedAnswers,
          updateSkipLogicRule: this.updateSkipLogicRule,
          handleModeForDate: this.handleModeForDate,
          handleRegex: this.handleRegex
        };
        formElements.push(<FormElementGroup {...propsGroup} />);
      }
    });
    return formElements;
  }

  handleExcludedAnswers = (name, status, index, elementIndex) => {
    this.setState(
      produce(draft => {
        _.forEach(
          draft.form.formElementGroups[index].formElements[elementIndex].concept.answers,
          answer => {
            if (answer.name === name) {
              if (status !== false) answer["excluded"] = status;
              else delete answer.excluded;
              return answer;
            }
          }
        );
        draft.detectBrowserCloseEvent = true;
      })
    );
  };

  handleGroupElementKeyValueChange = (index, propertyName, value, elementIndex) => {
    this.setState(
      produce(draft => {
        const formElement = draft.form.formElementGroups[index].formElements[elementIndex];
        if (propertyName === "identifierSource") {
          formElement.keyValues[propertyName] = value;
        } else if (propertyName === "editable") {
          value === "undefined"
            ? (formElement.keyValues[propertyName] = false)
            : delete formElement.keyValues[propertyName];
        } else if (propertyName === "datePickerMode") {
          formElement.keyValues[propertyName] = value;
        } else if (
          propertyName === "maxHeight" ||
          propertyName === "maxWidth" ||
          propertyName === "imageQuality" ||
          propertyName === "durationLimitInSecs" ||
          propertyName === "videoQuality"
        ) {
          formElement.keyValues[propertyName] = value;
        } else if (
          propertyName === "years" ||
          propertyName === "months" ||
          propertyName === "days" ||
          propertyName === "weeks" ||
          propertyName === "hours"
        ) {
          if (!Object.keys(formElement.keyValues).includes("durationOptions")) {
            formElement.keyValues["durationOptions"] = [];
          }
          if (formElement.keyValues["durationOptions"].includes(propertyName)) {
            formElement.keyValues["durationOptions"].splice(
              formElement.keyValues["durationOptions"].indexOf(propertyName),
              1
            );
          } else {
            formElement.keyValues["durationOptions"].push(value);
          }
        } else if (propertyName === "regex" || propertyName === "descriptionKey") {
          if (!formElement.validFormat) {
            formElement.validFormat = {};
          }
          if (value) value = value.trim();
          formElement.validFormat[propertyName] = value;
        }

        draft.detectBrowserCloseEvent = true;
      })
    );
  };

  handleGroupElementChange(index, propertyName, value, elementIndex = -1) {
    this.setState(
      produce(draft => {
        if (elementIndex === -1) {
          draft.form.formElementGroups[index][propertyName] = value;
        } else {
          draft.form.formElementGroups[index].formElements[elementIndex][propertyName] = value;
        }
        draft.detectBrowserCloseEvent = true;
      })
    );
  }

  btnGroupAdd(index, elementIndex = -1) {
    this.setState(
      produce(draft => {
        let form = draft.form;
        const formElement_temp = {
          uuid: UUID.v4(),
          displayOrder: -1,
          newFlag: "true",
          name: "",
          type: "",
          keyValues: {},
          showDateOrDuration: "durationOptions",
          mandatory: false,
          voided: false,
          expanded: true,
          concept: { name: "", dataType: "" },
          errorMessage: { name: false, concept: false, type: false }
        };
        if (elementIndex === -1) {
          form.formElementGroups.splice(index + 1, 0, {
            uuid: UUID.v4(),
            newFlag: "true",
            expanded: true,
            displayOrder: -1,
            name: "",
            display: "",
            voided: false,
            formElements: [formElement_temp]
          });
        } else {
          form.formElementGroups[index].formElements.splice(elementIndex + 1, 0, formElement_temp);
        }
        draft.detectBrowserCloseEvent = true;
      })
    );
  }

  btnGroupClick() {
    this.btnGroupAdd(0);
    this.setState({ createFlag: false });
  }
  // END Group level Events
  validateForm() {
    let flag = false;
    let errormsg = "";
    let numberGroupError = 0;
    let numberElementError = 0;
    this.setState(
      produce(draft => {
        draft.nameError = draft.name === "" ? true : false;
        _.forEach(draft.form.formElementGroups, group => {
          group.error = false;
          group.expanded = false;
          if (!group.voided && group.name.trim() === "") {
            group.error = true;
            flag = true;
            numberGroupError += 1;
          }
          let groupError = false;
          group.formElements.forEach(fe => {
            fe.errorMessage = {};
            fe.error = false;
            fe.expanded = false;
            if (fe.errorMessage) {
              Object.keys(fe.errorMessage).forEach(key => {
                fe.errorMessage[key] = false;
              });
            }
            if (
              !fe.voided &&
              (fe.name === "" ||
                fe.concept.dataType === "" ||
                fe.concept.dataType === "NA" ||
                (fe.concept.dataType === "Coded" && fe.type === "") ||
                (fe.concept.dataType === "Video" &&
                  parseInt(fe.keyValues.durationLimitInSecs) < 0) ||
                (fe.concept.dataType === "Image" && parseInt(fe.keyValues.maxHeight) < 0) ||
                (fe.concept.dataType === "Image" && parseInt(fe.keyValues.maxWidth) < 0) ||
                !areValidFormatValuesValid(fe))
            ) {
              numberElementError = numberElementError + 1;
              fe.error = true;

              fe.expanded = true;
              flag = groupError = true;
              if (fe.name === "") fe.errorMessage.name = true;
              if (fe.concept.dataType === "") fe.errorMessage.concept = true;
              if (fe.concept.dataType === "Coded" && fe.type === "") fe.errorMessage.type = true;
              if (fe.concept.dataType === "Video" && parseInt(fe.keyValues.durationLimitInSecs) < 0)
                fe.errorMessage.durationLimitInSecs = true;
              if (fe.concept.dataType === "Image" && parseInt(fe.keyValues.maxHeight) < 0)
                fe.errorMessage.maxHeight = true;
              if (fe.concept.dataType === "Image" && parseInt(fe.keyValues.maxWidth) < 0)
                fe.errorMessage.maxWidth = true;
              if (!areValidFormatValuesValid(fe)) fe.errorMessage.validFormat = true;
            }
          });
          if (groupError || group.error) {
            group.expanded = true;
          }
        });
        if (flag) {
          if (numberGroupError !== 0) {
            errormsg += "There is a error in " + numberGroupError + " form group";
            if (numberElementError !== 0)
              errormsg += " and " + numberElementError + " form element.";
          } else if (numberElementError !== 0)
            errormsg += "There is a error in " + numberElementError + " form element.";
        }
        draft.saveCall = !flag;
        draft.errorMsg = errormsg;
      })
    );
  }

  updateForm = event => {
    /*Have to deep clone state.form here as we want to modify this data before we send it to server.
     * Modifying this data directly will give an error as Immer freezes the state object for direct modifications.
     */

    // this.setState({
    //   form: keyValueForm
    // });
    let dataSend = cloneDeep(this.state.form);
    dataSend.name = this.state.name;
    _.forEach(dataSend.formElementGroups, (group, index) => {
      _.forEach(group.formElements, (element, index1) => {
        if (element.concept.dataType === "Coded") {
          const excluded = element.concept.answers.map(answer => {
            return answer.excluded && !answer.voided && answer.name;
          });
          const excludedAnswers = excluded.filter(obj => obj);
          if (!isEmpty(excludedAnswers)) {
            element.keyValues["ExcludedAnswers"] = excludedAnswers;
          } else if (element.keyValues["ExcludedAnswers"]) delete element.keyValues.ExcludedAnswers;
        }

        if (element.concept.dataType === "Video" && element.keyValues.durationLimitInSecs === "") {
          delete element.keyValues.durationLimitInSecs;
        }

        (element.concept.dataType === "Date" || element.concept.dataType === "Duration") &&
          element.keyValues["durationOptions"] &&
          element.keyValues["durationOptions"].length === 0 &&
          delete element.keyValues["durationOptions"];

        if (element.concept.dataType === "Image") {
          element.keyValues.maxHeight === "" && delete element.keyValues.maxHeight;
          element.keyValues.maxWidth === "" && delete element.keyValues.maxWidth;
        }

        if (
          element.validFormat &&
          isEmpty(element.validFormat.regex) &&
          isEmpty(element.validFormat.descriptionKey)
        ) {
          delete element.validFormat;
        }

        if (Object.keys(element.keyValues).length !== 0) {
          const tempKeyValue = Object.keys(element.keyValues).map(keyValue => {
            return { key: keyValue, value: element.keyValues[keyValue] };
          });

          element.keyValues = tempKeyValue;
        } else {
          element.keyValues = [];
        }
      });
    });
    this.reOrderSequence(dataSend);
    _.forEach(dataSend.formElementGroups, (group, index) => {
      this.reOrderSequence(dataSend, index);
    });
    http
      .post("/forms", dataSend)
      .then(response => {
        if (response.status === 200) {
          this.setState({
            saveCall: false,
            successAlert: true,
            defaultSnackbarStatus: true,
            detectBrowserCloseEvent: false
          });
        }
      })
      .catch(error => {
        this.setState({
          saveCall: false,
          errorMsg: "Server error received " + error.response.data
        });
      });
  };

  onDragEnd = result => {
    console.log(result);
    const { destination, source } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    if (result.type === "task") {
      const groupSourceIndex = result.source.droppableId.replace("Group", "");
      const groupDestinationIndex = result.destination.droppableId.replace("Group", "");
      const sourceElementIndex = result.source.index;
      const destinationElementIndex = result.destination.index;
      this.onUpdateDragDropOrder(
        groupSourceIndex,
        sourceElementIndex,
        destinationElementIndex,
        1,
        groupDestinationIndex
      );
    } else {
      const groupSourceIndex = result.source.droppableId.replace("Group", "");
      const sourceElementIndex = result.draggableId.replace("Element", "");
      const destinationElementIndex = result.destination.index;
      this.onUpdateDragDropOrder(
        groupSourceIndex,
        sourceElementIndex,
        destinationElementIndex,
        0,
        null
      );
    }
  };

  onRuleUpdate = (name, value) => {
    this.setState(
      produce(draft => {
        draft.form[name] = value;
        draft.detectBrowserCloseEvent = true;
      })
    );
  };

  onToggleExpandPanel = name => {
    this.setState(
      produce(draft => {
        draft.form[name] = !draft.form[name];
      })
    );
  };

  render() {
    const classes = {
      inputLabel: {
        marginTop: 15,
        fontSize: 12
      }
    };

    const form = (
      <Grid container>
        <Grid container alignContent="flex-end">
          <Grid item sm={10}>
            {this.state.nameError && <FormHelperText error>Form name is empty</FormHelperText>}
            <TextField
              type="string"
              id="name"
              label="Form name"
              placeholder="Enter form name"
              margin="normal"
              onChange={event => this.onUpdateFormName(event.target.value)}
              value={this.state.name}
              style={{ width: "50%" }}
              autoComplete="off"
            />
          </Grid>
          {this.state.createFlag && (
            <Grid item sm={2}>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                onClick={this.btnGroupClick}
                style={{ marginTop: "30px", marginBottom: "2px" }}
              >
                Add Group
              </Button>
            </Grid>
          )}

          {!this.state.createFlag && (
            <Grid item sm={2}>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                margin="normal"
                onClick={this.validateForm}
                style={{
                  marginTop: "30px",
                  marginBottom: "2px"
                }}
                disabled={!this.state.detectBrowserCloseEvent}
              >
                <SaveIcon />
                &nbsp;Save
              </Button>
            </Grid>
          )}
        </Grid>

        <Grid item sm={12}>
          <Tabs
            style={{ background: "#2196f3", color: "white" }}
            value={this.state.activeTabIndex}
            onChange={this.onTabHandleChange}
          >
            <Tab label="Details" />
            <Tab label="Rules" />
          </Tabs>
          <TabContainer hidden={this.state.activeTabIndex !== 0}>
            <Grid container item sm={12}>
              <Grid item sm={12}>
                {this.state.errorMsg !== "" && (
                  <FormControl fullWidth margin="dense">
                    <li style={{ color: "red" }}>{this.state.errorMsg}</li>
                  </FormControl>
                )}
              </Grid>
            </Grid>

            <DragDropContext onDragEnd={this.onDragEnd}>
              <Droppable droppableId="all-columns" direction="vertical" type="row">
                {provided => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {this.renderGroups()}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <Grid container item sm={12}>
              <Grid item sm={3}>
                {" "}
                <InputLabel style={classes.inputLabel}>
                  Created by : {this.state.form.createdBy}{" "}
                </InputLabel>
              </Grid>
              <Grid item sm={3}>
                {" "}
                <InputLabel style={classes.inputLabel}>
                  Last modified by : {this.state.form.lastModifiedBy}{" "}
                </InputLabel>
              </Grid>
              <Grid item sm={3}>
                {" "}
                <InputLabel style={classes.inputLabel}>
                  Creation datetime : {this.state.form.createdDateTime}{" "}
                </InputLabel>
              </Grid>
              <Grid item sm={3}>
                {" "}
                <InputLabel style={classes.inputLabel}>
                  Last modified datetime : {this.state.form.modifiedDateTime}{" "}
                </InputLabel>
              </Grid>
            </Grid>
            {/* </div> */}
          </TabContainer>

          <div hidden={this.state.activeTabIndex !== 1}>
            <FormLevelRules
              form={this.state.form}
              onRuleUpdate={this.onRuleUpdate}
              onToggleExpandPanel={this.onToggleExpandPanel}
            />
          </div>
        </Grid>
      </Grid>
    );
    return (
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title="Form Details" />

        {this.state.dataLoaded ? form : <div>Loading</div>}
        {this.state.successAlert && (
          <CustomizedSnackbar
            message="Successfully updated the form"
            getDefaultSnackbarStatus={this.getDefaultSnackbarStatus}
            defaultSnackbarStatus={this.state.defaultSnackbarStatus}
          />
        )}
        {this.state.saveCall && !this.state.nameError && this.updateForm()}
      </Box>
    );
  }
}

export default FormDetails;
