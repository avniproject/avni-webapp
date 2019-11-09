import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import { FormControl, Input, InputLabel, Select } from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import axios from "axios";
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
      programName: "",
      subjectType: "",
      encounterType: "",
      open: false,
      onClose: false,
      data: {},
      toFormDetails: "",
      errors: {},
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

    _.forEach(formMapping, (formMap, index) => {
      let uniqueString;
      if (this.state.formType === "ChecklistItem" || this.state.formType === "IndividualProfile") {
        uniqueString = formMap.subjectType;
        if (formMap.subjectType === "") {
          errorsList["unselectedData"]["subjectType" + index] = "Please select subject type.";
        }
      }

      if (
        this.state.formType === "ProgramEncounterCancellation" ||
        this.state.formType === "ProgramEncounter"
      ) {
        uniqueString = formMap.subjectType + formMap.programName + formMap.encounterType;
        if (formMap.subjectType === "") {
          errorsList["unselectedData"]["subjectType" + index] = "Please select subject type.";
        }
        if (formMap.programName === "") {
          errorsList["unselectedData"]["programName" + index] = "Please select program type.";
        }
        if (formMap.encounterType === "") {
          errorsList["unselectedData"]["encounterType" + index] = "Please select encounter type.";
        }
      }

      if (this.state.formType === "ProgramExit" || this.state.formType === "ProgramEnrolment") {
        uniqueString = formMap.subjectType + formMap.programName;
        if (formMap.subjectType === "") {
          errorsList["unselectedData"]["subjectType" + index] = "Please select subject type.";
        }
        if (formMap.programName === "") {
          errorsList["unselectedData"]["programName" + index] = "Please select program type.";
        }
      }

      if (this.state.formType === "Encounter") {
        uniqueString = formMap.subjectType + formMap.encounterType;
        if (formMap.subjectType === "") {
          errorsList["unselectedData"]["subjectType" + index] = "Please select subject type.";
        }

        if (formMap.encounterType === "") {
          errorsList["unselectedData"]["encounterType" + index] = "Please select encounter type.";
        }
      }
      if (existingMapping.includes(uniqueString)) {
        errorsList["existingMapping"][index] = "Same mapping already exist";
      }
      !formMap.voided && existingMapping.push(uniqueString);
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
  addFields() {
    const validateFormStatus = this.validateForm();
    if (validateFormStatus) {
      const existFormUUID = this.props.uuid;

      if (
        this.state.formType === "IndividualProfile" ||
        this.state.formType === "Encounter" ||
        this.state.formType === "ChecklistItem"
      ) {
        this.setState({ programName: "" });
      }

      if (
        this.state.formType !== "Encounter" &&
        this.state.formType !== "ProgramEncounter" &&
        this.state.formType !== "ProgramEncounterCancellation"
      ) {
        this.setState({ encounterType: "" });
      }
      axios
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

  componentDidMount() {
    this.setState({
      name: this.props.formData.name,
      formType: this.props.formData.formType,
      uuid: this.props.formData.uuid
    });
    axios
      .get("/web/operationalModules")
      .then(response => {
        let data = Object.assign({}, response.data);
        let formMappings = [];
        _.forEach(data.formMappings, formMapping => {
          if (formMapping.formUuid === this.props.formData.uuid) {
            formMappings.push({
              uuid: formMapping.uuid,
              programName: formMapping.programUuid,
              subjectType: formMapping.subjectTypeUuid,
              encounterType: formMapping.encounterTypeUuid,
              voided: false,
              newFlag: false
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
    this.setState(Object.assign({}, this.state, { [event.target.name]: event.target.value }));
  }

  programNameElement(index) {
    return (
      <FormControl fullWidth margin="dense">
        <InputLabel htmlFor="programName">Program Name</InputLabel>
        <Select
          name="programName"
          value={this.state.formMappings[index].programName}
          onChange={event => this.handleChange(index, "programName", event.target.value)}
        >
          {this.state.data.programs != null &&
            this.state.data.programs.map(program => (
              <MenuItem key={program.uuid} value={program.uuid}>
                {program.operationalProgramName}
              </MenuItem>
            ))}
        </Select>
        {this.state.errors.hasOwnProperty("unselectedData") &&
          (this.state.errors["unselectedData"].hasOwnProperty("programName" + index) && (
            <FormHelperText error>
              {this.state.errors["unselectedData"]["programName" + index]}
            </FormHelperText>
          ))}
      </FormControl>
    );
  }

  handleChange = (index, property, value) => {
    const changeMapping = this.state.formMappings;
    changeMapping[index][property] = value;
    this.setState({ formMappings: changeMapping });
  };

  subjectTypeElement(index) {
    return (
      <FormControl fullWidth margin="dense">
        <InputLabel htmlFor="subjectType">Subject Type</InputLabel>
        <Select
          name="subjectType"
          value={this.state.formMappings[index].subjectType}
          onChange={event => this.handleChange(index, "subjectType", event.target.value)}
        >
          {this.state.data.subjectTypes != null &&
            this.state.data.subjectTypes.map(subjectType => (
              <MenuItem key={subjectType.uuid} value={subjectType.uuid}>
                {subjectType.operationalSubjectTypeName}
              </MenuItem>
            ))}
        </Select>
        {this.state.errors.hasOwnProperty("unselectedData") &&
          (this.state.errors["unselectedData"].hasOwnProperty("subjectType" + index) && (
            <FormHelperText error>
              {this.state.errors["unselectedData"]["subjectType" + index]}
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
        <InputLabel htmlFor="encounterType">Encounter Type</InputLabel>
        <Select
          name="encounterType"
          value={this.state.formMappings[index].encounterType}
          onChange={event => this.handleChange(index, "encounterType", event.target.value)}
        >
          {this.state.data.encounterTypes != null &&
            this.state.data.encounterTypes.map(encounterType => (
              <MenuItem key={encounterType.uuid} value={encounterType.uuid}>
                {encounterType.name}
              </MenuItem>
            ))}
        </Select>

        {this.state.errors.hasOwnProperty("unselectedData") &&
          (this.state.errors["unselectedData"].hasOwnProperty("encounterType" + index) && (
            <FormHelperText error>
              {this.state.errors["unselectedData"]["encounterType" + index]}
            </FormHelperText>
          ))}
      </FormControl>
    );
  }
  removeMapping = index => {
    const mapping = this.state.formMappings;
    mapping[index].newFlag ? mapping.splice(index, 1) : (mapping[index]["voided"] = true);
    this.setState({
      formMappings: mapping
    });
  };
  addMapping = (program, encounter) => {
    this.setState({
      formMappings: [
        ...this.state.formMappings,
        {
          uuid: UUID.v4(),
          id: "",
          formUuid: this.state.uuid,
          subjectType: "",
          programName: program ? "" : null,
          encounterType: encounter ? "" : null,
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
    const submitButtonName = "Save";
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

          {this.state.formMappings.map((mapping, index) => {
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
                      <FormHelperText error>
                        {this.state.errors["existingMapping"][index]}
                      </FormHelperText>
                    ))}
                </div>
              )
            );
          })}
        </form>
        <Button
          color="primary"
          onClick={event => this.addMapping(programBased, encounterTypes)}
          style={{ marginTop: 10 }}
        >
          Add mapping
        </Button>
        <div>
          <Button
            variant="contained"
            color="primary"
            onClick={this.addFields.bind(this)}
            style={{ marginTop: 10 }}
          >
            {submitButtonName}
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
