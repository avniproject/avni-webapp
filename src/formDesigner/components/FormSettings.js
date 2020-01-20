import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import { FormControl, Input, InputLabel, Select } from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import http from "common/utils/httpClient";
import FormHelperText from "@material-ui/core/FormHelperText";
import CustomizedSnackbar from "./CustomizedSnackbar";
import _ from "lodash";
import Grid from "@material-ui/core/Grid";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import { default as UUID } from "uuid";
import { constFormType } from "../common/constants";

class FormSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      uuid: "",
      name: "",
      formType: "",
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

  validateForm() {
    let errorsList = {};
    let formMapping = this.state.formMappings;
    let existingMapping = [];
    if (this.state.name === "") errorsList["name"] = "Please enter form name.";
    if (this.state.formType === "") errorsList["formType"] = "Please select form type.";
    errorsList["existingMapping"] = {};
    errorsList["unselectedData"] = {};

    if (this.state.formType !== "ChecklistItem") {
      let count = 0;
      _.forEach(this.state.formMappings, function(formMap, index) {
        if (!formMap.voided) count += 1;
      });
      if (count === 0) errorsList["name"] = "Please add atleast one form mapping.";
    }

    _.forEach(formMapping, (formMap, index) => {
      let uniqueString;
      if (!formMap.voided) {
        if (this.state.formType === "IndividualProfile") {
          uniqueString = formMap.subjectTypeUuid;
          if (formMap.subjectTypeUuid === "") {
            errorsList["unselectedData"]["subjectTypeUuid" + index] = "Please select subject type.";
          }
        }

        if (
          this.state.formType === "ProgramEncounterCancellation" ||
          this.state.formType === "ProgramEncounter"
        ) {
          uniqueString = formMap.subjectTypeUuid + formMap.programUuid + formMap.encounterTypeUuid;
          if (formMap.subjectTypeUuid === "") {
            errorsList["unselectedData"]["subjectTypeUuid" + index] = "Please select subject type.";
          }
          if (formMap.programUuid === "") {
            errorsList["unselectedData"]["programUuid" + index] = "Please select program type.";
          }
          if (formMap.encounterTypeUuid === "") {
            errorsList["unselectedData"]["encounterTypeUuid" + index] =
              "Please select encounter type.";
          }
        }

        if (this.state.formType === "ProgramExit" || this.state.formType === "ProgramEnrolment") {
          uniqueString = formMap.subjectTypeUuid + formMap.programUuid;
          if (formMap.subjectTypeUuid === "") {
            errorsList["unselectedData"]["subjectTypeUuid" + index] = "Please select subject type.";
          }
          if (formMap.programUuid === "") {
            errorsList["unselectedData"]["programUuid" + index] = "Please select program type.";
          }
        }

        if (this.state.formType === "Encounter") {
          uniqueString = formMap.subjectTypeUuid + formMap.encounterTypeUuid;
          if (formMap.subjectTypeUuid === "") {
            errorsList["unselectedData"]["subjectTypeUuid" + index] = "Please select subject type.";
          }

          if (formMap.encounterTypeUuid === "") {
            errorsList["unselectedData"]["encounterTypeUuid" + index] =
              "Please select encounter type.";
          }
        }
        if (existingMapping.includes(uniqueString)) {
          errorsList["existingMapping"][index] = "Same mapping already exist";
        }
        existingMapping.push(uniqueString);
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
        const existFormUUID = this.props.uuid;
        this.setState({ errorMsg: "" });
        http
          .put("/web/forms/" + existFormUUID + "/metadata", {
            name: this.state.name,
            formType: this.state.formType,
            formMappings: this.state.formMappings
          })
          .then(response => {
            let formMapping = this.state.formMappings;
            _.forEach(formMapping, (formMap, index) => {
              formMap.newFlag = false;
            });
            this.setState({
              showUpdateAlert: true,
              defaultSnackbarStatus: true,
              formMapping: formMapping
            });

            this.props.onUpdateFormName(this.state.name);
          })
          .catch(error => {
            if (error.response.status === 404) {
              this.setState({
                showUpdateAlert: true,
                defaultSnackbarStatus: true
              });
              this.props.onUpdateFormName(this.state.name);
            } else {
              this.setState({ errorMsg: error.response.data, showUpdateAlert: false });
            }
          });
      }
    }
  }

  componentDidMount() {
    this.setState({
      name: this.props.formData.name,
      formType: this.props.formData.formType,
      uuid: this.props.formData.uuid
    });
    http
      .get("/web/operationalModules")
      .then(response => {
        let data = Object.assign({}, response.data);
        let formMappings = [];
        _.forEach(data.formMappings, formMapping => {
          if (formMapping.formUuid === this.props.formData.uuid) {
            formMappings.push({
              uuid: formMapping.uuid,
              programUuid: formMapping.programUuid,
              subjectTypeUuid: formMapping.subjectTypeUuid,
              encounterTypeUuid: formMapping.encounterTypeUuid,
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
    if (event.target.name === "formType" && event.target.value !== this.state.formType) {
      const formMappings = [...this.state.formMappings];
      _.forEach(formMappings, function(formMap, index) {
        formMap["voided"] = true;
      });
      this.setState(
        Object.assign({}, this.state, {
          [event.target.name]: event.target.value,
          formMappings: formMappings,
          warningFlag: true,
          dirtyFlag: true
        })
      );
    } else {
      if (event.target.value !== this.state.formType) {
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
        <InputLabel htmlFor="programUuid">Program Name</InputLabel>
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
        {this.state.errors.hasOwnProperty("unselectedData") &&
          (this.state.errors["unselectedData"].hasOwnProperty("programUuid" + index) && (
            <FormHelperText error>
              {this.state.errors["unselectedData"]["programUuid" + index]}
            </FormHelperText>
          ))}
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

  subjectTypeElement(index) {
    return (
      <FormControl fullWidth margin="dense">
        <InputLabel htmlFor="subjectTypeUuid">Subject Type</InputLabel>
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
        {this.state.errors.hasOwnProperty("unselectedData") &&
          (this.state.errors["unselectedData"].hasOwnProperty("subjectTypeUuid" + index) && (
            <FormHelperText error>
              {this.state.errors["unselectedData"]["subjectTypeUuid" + index]}
            </FormHelperText>
          ))}
      </FormControl>
    );
  }

  formTypeElement() {
    const formTypes = [
      "IndividualProfile",
      "Encounter",
      "ProgramEncounter",
      "ProgramEnrolment",
      "ProgramExit",
      "ProgramEncounterCancellation",
      "ChecklistItem"
    ];

    return formTypes.map(formType => {
      return (
        <MenuItem key={formType} value={formType}>
          {constFormType[formType]}
        </MenuItem>
      );
    });
  }

  encounterTypesElement(index) {
    return (
      <FormControl fullWidth margin="dense">
        <InputLabel htmlFor="encounterTypeUuid">Encounter Type</InputLabel>
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

        {this.state.errors.hasOwnProperty("unselectedData") &&
          (this.state.errors["unselectedData"].hasOwnProperty("encounterTypeUuid" + index) && (
            <FormHelperText error>
              {this.state.errors["unselectedData"]["encounterTypeUuid" + index]}
            </FormHelperText>
          ))}
      </FormControl>
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
    const encounterTypes =
      this.state.formType === "Encounter" ||
      this.state.formType === "ProgramEncounter" ||
      this.state.formType === "ProgramEncounterCancellation";
    const programBased =
      this.state.formType === "ProgramEncounter" ||
      this.state.formType === "ProgramExit" ||
      this.state.formType === "ProgramEnrolment" ||
      this.state.formType === "ProgramEncounterCancellation";
    const checklistItemBased =
      this.state.formType !== "" && this.state.formType !== "ChecklistItem";

    return (
      <div>
        <form>
          {this.state.errorMsg && (
            <FormControl fullWidth margin="dense">
              <li style={{ color: "red" }}>{this.state.errorMsg}</li>
            </FormControl>
          )}
          <FormControl fullWidth margin="dense">
            <InputLabel htmlFor="formType">Form Type</InputLabel>
            <Select
              id="formType"
              name="formType"
              value={this.state.formType}
              onChange={this.onChangeField.bind(this)}
              required
            >
              {this.formTypeElement()}
            </Select>
            {this.state.errors.formType && (
              <FormHelperText error>{this.state.errors.formType}</FormHelperText>
            )}
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel htmlFor="name">Name</InputLabel>
            <Input
              type="text"
              id="formName"
              name="name"
              value={this.state.name}
              onChange={this.onChangeField.bind(this)}
              fullWidth
            />
            {this.state.errors.name && (
              <FormHelperText error>{this.state.errors.name}</FormHelperText>
            )}
          </FormControl>

          {checklistItemBased &&
            this.state.formMappings.map((mapping, index) => {
              return (
                !mapping.voided && (
                  <div key={index}>
                    <Grid container item sm={12} spacing={2}>
                      <Grid item sm={3}>
                        {this.subjectTypeElement(index)}
                      </Grid>
                      {programBased && (
                        <Grid item sm={4}>
                          {this.programNameElement(index)}
                        </Grid>
                      )}
                      {encounterTypes && (
                        <Grid item sm={4}>
                          {this.encounterTypesElement(index)}
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
                      (this.state.errors["existingMapping"].hasOwnProperty(index) && (
                        <FormControl fullWidth margin="dense">
                          <FormHelperText error>
                            {this.state.errors["existingMapping"][index]}
                          </FormHelperText>
                        </FormControl>
                      ))}
                  </div>
                )
              );
            })}
        </form>
        {checklistItemBased && (
          <Button
            color="primary"
            onClick={event => this.addMapping(programBased, encounterTypes)}
            style={{ marginTop: 10 }}
          >
            Add mapping
          </Button>
        )}
        <div>
          <Button
            variant="contained"
            color="primary"
            disabled={!this.state.dirtyFlag}
            onClick={this.onFormSubmit.bind(this)}
            style={{ marginTop: 10 }}
          >
            Save
          </Button>
        </div>
        {this.state.showUpdateAlert && (
          <CustomizedSnackbar
            message="Form settings updated successfully!"
            getDefaultSnackbarStatus={this.getDefaultSnackbarStatus}
            defaultSnackbarStatus={this.state.defaultSnackbarStatus}
          />
        )}
      </div>
    );
  }
}

export default FormSettings;
