import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import { FormControl, Input, InputLabel, Select } from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import axios from "axios";
import { Redirect } from "react-router-dom";
import FormHelperText from "@material-ui/core/FormHelperText";
import CustomizedSnackbar from "./CustomizedSnackbar";
class NewFormModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: props.name,
      formType: "",
      programName: "",
      subjectType: "",
      encounterType: "",
      open: false,
      onClose: false,
      data: {},
      toFormDetails: "",
      errors: { name: "", formType: "", programName: "", subjectType: "", encounterType: "" },
      showUpdateAlert: false,
      defaultSnackbarStatus: true
    };
  }

  validateForm() {
    let errorsList = {};
    if (this.state.name === "") errorsList["name"] = "Please enter form name.";
    if (this.state.formType === "") errorsList["formType"] = "Please select form type.";
    if (this.state.subjectType === "") errorsList["subjectType"] = "Please select subject type.";
    if (
      (this.state.formType === "ProgramEncounter" ||
        this.state.formType === "ProgramExit" ||
        this.state.formType === "ProgramEnrolment" ||
        this.state.formType === "ProgramEncounterCancellation") &&
      this.state.programName === ""
    )
      errorsList["programName"] = "Please select program name.";
    if (
      (this.state.formType === "Encounter" ||
        this.state.formType === "ProgramEncounter" ||
        this.state.formType === "ProgramEncounterCancellation") &&
      this.state.encounterType === ""
    )
      errorsList["encounterType"] = "Please select encounter type.";

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
    if (validateFormStatus && this.props.isCreateFrom) {
      let dataSend = {
        name: this.state.name,
        formType: this.state.formType,
        subjectType: this.state.subjectType
      };
      dataSend["programName"] = this.state.programName;
      dataSend["encounterType"] = this.state.encounterType;
      axios
        .post("/web/forms", dataSend)
        .then(response => {
          this.setState({
            toFormDetails: response.data.uuid
          });
        })
        .catch(error => {
          this.setState({ errorMsg: error.response.data });
        });
    } else if (validateFormStatus && this.props.isCreateFrom === false) {
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
          encounterType: this.state.encounterType,
          subjectType: this.state.subjectType,
          programName: this.state.programName
        })
        .then(response => {
          if (this.props.isCreateFrom === false) {
            this.setState({
              showUpdateAlert: true,
              defaultSnackbarStatus: true
            });
            this.props.onUpdateFormName(this.state.name);
          }
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
    if (this.props.isCreateFrom === false) {
      axios
        .get(`/forms/export?formUUID=${this.props.uuid}`)
        .then(response => {
          this.setState({
            name: response.data.name,
            formType: response.data.formType,
            subjectType: response.data.subjectType
          });

          if (response.data.encounterTypes) {
            this.setState({ encounterType: response.data.encounterTypes[0] });
          }
          if (response.data.programName) {
            this.setState({ programName: response.data.programName });
          }
        })
        .catch(error => {
          console.log(error);
        });
    }
    axios
      .get("/web/operationalModules")
      .then(response => {
        let data = Object.assign({}, response.data);
        delete data["formMappings"];
        this.setState({
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

  handleClickOpen() {
    this.setState({
      formType: "",
      subjectType: "",
      programName: "",
      encounterType: "",
      open: true
    });
  }

  programNameElement() {
    return (
      <FormControl fullWidth margin="dense">
        <InputLabel htmlFor="programName">Program Name</InputLabel>
        <Select
          id="programName"
          name="programName"
          value={this.state.programName}
          onChange={this.onChangeField.bind(this)}
        >
          {this.state.data.programs != null &&
            this.state.data.programs.map(program => (
              <MenuItem key={program.operationalProgramName} value={program.operationalProgramName}>
                {program.operationalProgramName}
              </MenuItem>
            ))}
        </Select>
        {this.state.errors.programName && (
          <FormHelperText error>{this.state.errors.programName}</FormHelperText>
        )}
      </FormControl>
    );
  }

  subjectTypeElement() {
    return (
      <FormControl fullWidth margin="dense">
        <InputLabel htmlFor="subjectType">Subject Type</InputLabel>
        <Select
          id="subjectType"
          name="subjectType"
          value={this.state.subjectType}
          onChange={this.onChangeField.bind(this)}
        >
          {this.state.data.subjectTypes != null &&
            this.state.data.subjectTypes.map(subjectType => (
              <MenuItem
                key={subjectType.operationalSubjectTypeName}
                value={subjectType.operationalSubjectTypeName}
              >
                {subjectType.operationalSubjectTypeName}
              </MenuItem>
            ))}
        </Select>
        {this.state.errors.subjectType && (
          <FormHelperText error>{this.state.errors.subjectType}</FormHelperText>
        )}
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
          {formType}
        </MenuItem>
      );
    });
  }

  encounterTypesElement() {
    return (
      <FormControl fullWidth margin="dense">
        <InputLabel htmlFor="encounterType">Encounter Type</InputLabel>
        <Select
          id="encounterType"
          name="encounterType"
          value={this.state.encounterType}
          onChange={this.onChangeField.bind(this)}
        >
          {this.state.data.encounterTypes != null &&
            this.state.data.encounterTypes.map(encounterType => (
              <MenuItem key={encounterType.name} value={encounterType.name}>
                {encounterType.name}
              </MenuItem>
            ))}
        </Select>
        {this.state.errors.encounterType && (
          <FormHelperText error>{this.state.errors.encounterType}</FormHelperText>
        )}
      </FormControl>
    );
  }

  render() {
    if (this.state.toFormDetails !== "") {
      return <Redirect to={"/forms/" + this.state.toFormDetails} />;
    }
    const encounterTypes =
      this.state.formType === "Encounter" ||
      this.state.formType === "ProgramEncounter" ||
      this.state.formType === "ProgramEncounterCancellation";
    const programBased =
      this.state.formType === "ProgramEncounter" ||
      this.state.formType === "ProgramExit" ||
      this.state.formType === "ProgramEnrolment" ||
      this.state.formType === "ProgramEncounterCancellation";
    const submitButtonName = this.props.isCreateFrom ? "Add" : "Update";

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
          {this.subjectTypeElement()}
          {programBased && this.programNameElement()}
          {encounterTypes && this.encounterTypesElement()}
        </form>
        <Button
          variant="contained"
          color="primary"
          onClick={this.addFields.bind(this)}
          style={{ marginTop: 10 }}
        >
          {submitButtonName}
        </Button>
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

NewFormModal.defaultProps = {
  name: "",
  uuid: "",
  isCreateFrom: true
};

export default NewFormModal;
