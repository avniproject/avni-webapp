import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import { FormControl, Select } from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import http from "common/utils/httpClient";
import FormHelperText from "@material-ui/core/FormHelperText";
import CustomizedSnackbar from "./CustomizedSnackbar";
import _ from "lodash";
import Grid from "@material-ui/core/Grid";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import { default as UUID } from "uuid";
import { FormTypeEntities, encounterFormTypes, programFormTypes } from "../common/constants";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import { SaveComponent } from "../../common/components/SaveComponent";
import { AvniFormLabel } from "../../common/components/AvniFormLabel";
import { AvniSwitch } from "../../common/components/AvniSwitch";

class FormSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      uuid: "",
      name: "",
      formTypeInfo: null,
      formMappings: [],
      onClose: false,
      data: {},
      toFormDetails: "",
      errors: {},
      warningFlag: false,
      dirtyFlag: false,
      showUpdateAlert: false,
      defaultSnackbarStatus: true
    };
  }

  static addSubjectTypeErrorIfMissing(errorsList, formMap, index) {
    FormSettings.addErrorIfMissing(errorsList, formMap, "subjectTypeUuid", index, "subject type");
  }

  static addProgramErrorIfMissing(errorsList, formMap, index) {
    FormSettings.addErrorIfMissing(errorsList, formMap, "programUuid", index, "program");
  }

  static addEncounterTypeErrorIfMissing(errorsList, formMap, index) {
    FormSettings.addErrorIfMissing(
      errorsList,
      formMap,
      "encounterTypeUuid",
      index,
      "encounter type"
    );
  }

  static addErrorIfMissing(errorsList, formMap, fieldKey, index, fieldName) {
    if (formMap[fieldKey] === "") {
      errorsList.unselectedData[fieldKey + index] = `Please select ${fieldName}.`;
    }
  }

  validateForm() {
    if (_.every(this.state.formMappings, fm => fm.voided)) {
      return true;
    }
    const errorsList = {
      existingMapping: {},
      unselectedData: {}
    };
    const formMappings = this.state.formMappings;
    const existingMappings = [];

    if (_.isNil(this.state.formTypeInfo)) errorsList["formTypeInfo"] = "Please select form type.";

    if (this.state.formTypeInfo !== FormTypeEntities.ChecklistItem) {
      let count = 0;
      _.forEach(this.state.formMappings, function(formMap) {
        if (!formMap.voided) count += 1;
      });
      if (count === 0) errorsList["name"] = "Please add atleast one form mapping.";
    }

    _.forEach(formMappings, (formMap, index) => {
      let uniqueString;
      const formTypeInfo = this.state.formTypeInfo;
      if (!formMap.voided) {
        if (formTypeInfo === FormTypeEntities.IndividualProfile) {
          uniqueString = formMap.subjectTypeUuid;
          FormSettings.addSubjectTypeErrorIfMissing(errorsList, formMap, index);
        }

        if (FormTypeEntities.isForProgramEncounter(formTypeInfo)) {
          uniqueString = formMap.subjectTypeUuid + formMap.programUuid + formMap.encounterTypeUuid;
          FormSettings.addSubjectTypeErrorIfMissing(errorsList, formMap, index);
          FormSettings.addProgramErrorIfMissing(errorsList, formMap, index);
          FormSettings.addEncounterTypeErrorIfMissing(errorsList, formMap, index);
        }

        if (FormTypeEntities.isForProgramEnrolment(formTypeInfo)) {
          uniqueString = formMap.subjectTypeUuid + formMap.programUuid;
          FormSettings.addSubjectTypeErrorIfMissing(errorsList, formMap, index);
          FormSettings.addProgramErrorIfMissing(errorsList, formMap, index);
        }

        if (FormTypeEntities.isForSubjectEncounter(formTypeInfo)) {
          uniqueString = formMap.subjectTypeUuid + formMap.encounterTypeUuid;
          FormSettings.addSubjectTypeErrorIfMissing(errorsList, formMap, index);
          FormSettings.addEncounterTypeErrorIfMissing(errorsList, formMap, index);
        }
        if (existingMappings.includes(uniqueString)) {
          errorsList["existingMapping"][index] = "Same mapping already exist";
        }
        existingMappings.push(uniqueString);
      }
    });

    if (Object.keys(errorsList["unselectedData"]).length === 0) {
      delete errorsList.unselectedData;
    }
    if (Object.keys(errorsList["existingMapping"]).length === 0) {
      delete errorsList.existingMapping;
    }

    this.setState({
      errors: errorsList
    });

    let errorFlag = true;
    if (Object.keys(errorsList).length > 0) errorFlag = false;
    return errorFlag;
  }

  getDefaultSnackbarStatus = defaultSnackbarStatus => {
    this.setState({ defaultSnackbarStatus: defaultSnackbarStatus });
  };

  onFormSubmit() {
    const validateFormStatus = this.validateForm();
    const voidedMessage = `Are you sure you want to change form details? It may result in your form not showing up in AVNI application so please do it only if you aware of the consequences.`;
    if (validateFormStatus) {
      if (!this.state.warningFlag || (this.state.warningFlag && window.confirm(voidedMessage))) {
        const existFormUUID = this.state.uuid;
        this.setState({ errorMsg: "" });
        return http
          .put("/web/forms/" + existFormUUID + "/metadata", {
            name: this.state.name,
            formType: this.state.formTypeInfo.formType,
            formMappings: this.state.formMappings
          })
          .then(response => {
            const formMapping = this.state.formMappings;
            _.forEach(formMapping, (formMap, index) => {
              formMap.newFlag = false;
            });
            this.setState({
              showUpdateAlert: true,
              defaultSnackbarStatus: true,
              formMapping: formMapping
            });
          })
          .catch(error => {
            console.log(error);
            if (error.response.status === 404) {
              this.setState({
                showUpdateAlert: true,
                defaultSnackbarStatus: true
              });
            } else {
              this.setState({ errorMsg: error.response.data, showUpdateAlert: false });
            }
          });
      }
    }
  }

  componentDidMount() {
    http
      .get(`/forms/export?formUUID=${this.props.match.params.id}`)
      .then(response => {
        this.setState({
          name: response.data.name,
          formTypeInfo: FormTypeEntities.getFormTypeInfo(response.data.formType),
          uuid: response.data.uuid
        });
      })
      .catch(error => {
        console.log(error);
      });

    http
      .get("/web/operationalModules")
      .then(response => {
        let data = Object.assign({}, response.data);
        const formMappings = [];
        _.forEach(data.formMappings, formMapping => {
          if (formMapping.formUUID === this.props.match.params.id) {
            formMappings.push({
              uuid: formMapping.uuid,
              programUuid: formMapping.programUUID,
              subjectTypeUuid: formMapping.subjectTypeUUID,
              encounterTypeUuid: formMapping.encounterTypeUUID,
              taskTypeUuid: formMapping.taskTypeUUID,
              enableApproval: formMapping.enableApproval,
              voided: false,
              newFlag: false,
              updatedFlag: false
            });
          }
        });
        delete data["formMappings"];
        this.setState({
          formMappings: formMappings,
          data: data
        });
      })
      .catch(error => {
        console.log(error);
      });
  }

  onChangeField(event) {
    if (event.target.name === "formType" && event.target.value !== this.state.formTypeInfo) {
      const formMappings = [...this.state.formMappings];
      _.forEach(formMappings, function(formMap, index) {
        formMap["voided"] = true;
      });
      this.setState(
        Object.assign({}, this.state, {
          formTypeInfo: event.target.value,
          formMappings: formMappings,
          warningFlag: true,
          dirtyFlag: true
        })
      );
    } else {
      if (event.target.value !== this.state.formTypeInfo) {
        this.setState(
          Object.assign({}, this.state, {
            [event.target.name]: event.target.value,
            dirtyFlag: true
          })
        );
      }
    }
  }

  programNameElement(index) {
    return (
      <FormControl fullWidth margin="dense">
        <AvniFormLabel
          label={"Program Name"}
          toolTipKey={"APP_DESIGNER_FORM_MAPPING_PROGRAM_NAME"}
        />
        <Select
          name="programUuid"
          value={this.state.formMappings[index].programUuid}
          onChange={event => this.handleMappingChange(index, "programUuid", event.target.value)}
        >
          {this.state.data.programs != null &&
            this.state.data.programs.map(program => (
              <MenuItem key={program.uuid} value={program.uuid}>
                {program.operationalProgramName}
              </MenuItem>
            ))}
        </Select>
        {this.renderError("programUuid", index)}
      </FormControl>
    );
  }

  handleMappingChange = (index, property, value) => {
    const formMappings = [...this.state.formMappings];
    if (formMappings[index][property] !== value) {
      if (!formMappings[index]["newFlag"]) {
        this.setState({ warningFlag: true });
      }
      formMappings[index][property] = value;
      this.setState({ formMappings, dirtyFlag: true });
    }
  };

  taskTypeElement(index) {
    return (
      <FormControl fullWidth margin="dense">
        <AvniFormLabel label={"Task Name"} toolTipKey={"APP_DESIGNER_FORM_MAPPING_TASK_NAME"} />
        <Select
          name="taskUuid"
          value={this.state.formMappings[index].taskTypeUuid}
          onChange={event => this.handleMappingChange(index, "taskTypeUuid", event.target.value)}
        >
          {this.state.data["taskTypes"] != null &&
            this.state.data["taskTypes"].map(taskType => (
              <MenuItem key={taskType.uuid} value={taskType.uuid}>
                {taskType.name}
              </MenuItem>
            ))}
        </Select>
        {this.renderError("taskTypeUuid", index)}
      </FormControl>
    );
  }

  subjectTypeElement(index) {
    return (
      <FormControl fullWidth margin="dense">
        <AvniFormLabel
          label={"Subject Type"}
          toolTipKey={"APP_DESIGNER_FORM_MAPPING_SUBJECT_TYPE"}
        />
        <Select
          name="subjectTypeUuid"
          value={this.state.formMappings[index].subjectTypeUuid}
          onChange={event => this.handleMappingChange(index, "subjectTypeUuid", event.target.value)}
        >
          {this.state.data.subjectTypes != null &&
            this.state.data.subjectTypes.map(subjectType => (
              <MenuItem key={subjectType.uuid} value={subjectType.uuid}>
                {subjectType.operationalSubjectTypeName}
              </MenuItem>
            ))}
        </Select>
        {this.renderError("subjectTypeUuid", index)}
      </FormControl>
    );
  }

  formTypes() {
    return FormTypeEntities.getAllFormTypeInfo().map(formTypeInfo => {
      return (
        <MenuItem key={formTypeInfo} value={formTypeInfo}>
          {formTypeInfo.display}
        </MenuItem>
      );
    });
  }

  encounterTypesElement(index) {
    return (
      <FormControl fullWidth margin="dense">
        <>
          <AvniFormLabel
            label={"Encounter Type"}
            toolTipKey={"APP_DESIGNER_FORM_MAPPING_ENCOUNTER_TYPE"}
          />
          <Select
            name="encounterTypeUuid"
            value={this.state.formMappings[index].encounterTypeUuid}
            onChange={event =>
              this.handleMappingChange(index, "encounterTypeUuid", event.target.value)
            }
          >
            {this.state.data.encounterTypes != null &&
              this.state.data.encounterTypes.map(encounterType => (
                <MenuItem key={encounterType.uuid} value={encounterType.uuid}>
                  {encounterType.name}
                </MenuItem>
              ))}
          </Select>
        </>

        {this.renderError("encounterTypeUuid", index)}
      </FormControl>
    );
  }

  renderError(propertyName, index) {
    return (
      this.state.errors.hasOwnProperty("unselectedData") &&
      this.state.errors["unselectedData"].hasOwnProperty(propertyName + index) && (
        <FormHelperText error>
          {this.state.errors["unselectedData"][propertyName + index]}
        </FormHelperText>
      )
    );
  }

  removeMapping = index => {
    const formMappings = [...this.state.formMappings];
    if (formMappings[index].newFlag) {
      formMappings.splice(index, 1);
      this.setState({
        formMappings
      });
    } else {
      formMappings[index]["voided"] = true;
      this.setState({
        formMappings,
        dirtyFlag: true,
        warningFlag: true
      });
    }
  };
  addMapping = (program, encounter) => {
    this.setState({
      dirtyFlag: true,
      formMappings: [
        ...this.state.formMappings,
        {
          uuid: UUID.v4(),
          id: "",
          formUuid: this.state.uuid,
          subjectTypeUuid: "",
          programUuid: program ? "" : null,
          encounterTypeUuid: encounter ? "" : null,
          newFlag: true
        }
      ]
    });
  };

  render() {
    const encounterTypes = encounterFormTypes.includes(this.state.formTypeInfo);
    const programBased = programFormTypes.includes(this.state.formTypeInfo);
    const notChecklistItemBased = FormTypeEntities.ChecklistItem !== this.state.formTypeInfo;
    const isTaskFormType = FormTypeEntities.Task === this.state.formTypeInfo;

    return (
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title={this.state.name} />
        <div>
          <form>
            {this.state.errorMsg && (
              <FormControl fullWidth margin="dense">
                <li style={{ color: "red" }}>{this.state.errorMsg}</li>
              </FormControl>
            )}
            <AvniFormLabel
              label={"Form name"}
              style={{ fontSize: "12px" }}
              toolTipKey={"APP_DESIGNER_FORM_MAPPING_FORM_NAME"}
            />
            {this.state.name}
            <FormControl fullWidth margin="dense">
              <AvniFormLabel
                label={"Form Type"}
                toolTipKey={"APP_DESIGNER_FORM_MAPPING_FORM_TYPE"}
              />
              <Select
                id="formType"
                name="formType"
                value={this.state.formTypeInfo}
                onChange={this.onChangeField.bind(this)}
                required
              >
                {this.formTypes()}
              </Select>
              {this.state.errors.formTypeInfo && (
                <FormHelperText error>{this.state.errors.formTypeInfo.formType}</FormHelperText>
              )}
            </FormControl>

            {notChecklistItemBased &&
              this.state.formMappings.map((mapping, index) => {
                return (
                  !mapping.voided && (
                    <div key={index}>
                      <Grid container item sm={12} spacing={2}>
                        {!isTaskFormType && (
                          <Grid item sm={2}>
                            {this.subjectTypeElement(index)}
                          </Grid>
                        )}
                        {isTaskFormType && (
                          <Grid item sm={2}>
                            {this.taskTypeElement(index)}
                          </Grid>
                        )}
                        {programBased && (
                          <Grid item sm={3}>
                            {this.programNameElement(index)}
                          </Grid>
                        )}
                        {encounterTypes && (
                          <Grid item sm={3}>
                            {this.encounterTypesElement(index)}
                          </Grid>
                        )}
                        {!isTaskFormType && (
                          <Grid item sm={3} style={{ marginTop: 40 }}>
                            <AvniSwitch
                              checked={this.state.formMappings[index].enableApproval}
                              onChange={event =>
                                this.handleMappingChange(
                                  index,
                                  "enableApproval",
                                  event.target.checked
                                )
                              }
                              name="Enable Approval"
                              toolTipKey={"APP_DESIGNER_ENABLE_APPROVAL"}
                            />
                          </Grid>
                        )}
                        <Grid item sm={1}>
                          <IconButton
                            aria-label="delete"
                            onClick={event => this.removeMapping(index)}
                            style={{ marginTop: 10 }}
                          >
                            <DeleteIcon fontSize="inherit" />
                          </IconButton>
                        </Grid>
                      </Grid>
                      {this.state.errors.hasOwnProperty("existingMapping") &&
                        this.state.errors["existingMapping"].hasOwnProperty(index) && (
                          <FormControl fullWidth margin="dense">
                            <FormHelperText error>
                              {this.state.errors["existingMapping"][index]}
                            </FormHelperText>
                          </FormControl>
                        )}
                    </div>
                  )
                );
              })}
          </form>
          {notChecklistItemBased && (
            <Button
              color="primary"
              onClick={event => this.addMapping(programBased, encounterTypes)}
              style={{ marginTop: 10 }}
            >
              Add mapping
            </Button>
          )}
          <div>
            <SaveComponent
              name="Save"
              onSubmit={this.onFormSubmit.bind(this)}
              styleClass={{ marginTop: 10 }}
              disabledFlag={!this.state.dirtyFlag}
            />
          </div>
          {this.state.showUpdateAlert && (
            <CustomizedSnackbar
              message="Form settings updated successfully!"
              getDefaultSnackbarStatus={this.getDefaultSnackbarStatus}
              defaultSnackbarStatus={this.state.defaultSnackbarStatus}
            />
          )}
        </div>
      </Box>
    );
  }
}

export default FormSettings;
