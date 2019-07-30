import React, { Component } from "react";
import TagsInput from "react-tagsinput";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import { FormControl } from "@material-ui/core";
import { Input } from "@material-ui/core";
import { InputLabel } from "@material-ui/core";
import { Select } from "@material-ui/core";
import { Chip } from "@material-ui/core";
import NoSsr from "@material-ui/core/NoSsr";

class NewFormModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      formType: "IndividualProfile",
      programName: "Mother",
      open: false,
      onClose: false
    };
    this.handleClickOpen = this.handleClickOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  addFields() {
    this.props.addNewForm(
      this.state.name,
      this.state.formType,
      this.state.programName,
      this.state.encounterTypes
    );
    this.props.initGroups();
    this.props.history.push("/forms/addFields");
  }

  onChangeField(event) {
    this.setState(
      Object.assign({}, this.state, { [event.target.name]: event.target.value })
    );
  }

  onChangeEncounterField(encounterTypes) {
    this.setState(
      Object.assign({}, this.state, { encounterTypes: encounterTypes })
    );
  }

  handleClickOpen() {
    this.setState({
      open: true
    });
  }

  handleClose() {
    this.setState({ open: false });
  }

  NewFormButton() {
    return (
      <div style={{ "text-align": "right" }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={this.handleClickOpen}
        >
          {" "}
          New Form{" "}
        </Button>
      </div>
    );
  }

  programNameElement() {
    return (
      <FormControl fullWidth>
        <InputLabel>Program Name</InputLabel>
        <Select
          native
          id="programNameSelect"
          name="programName"
          onChange={this.onChangeField.bind(this)}
        >
          <option value="" />
          <option>Mother</option>
          <option>Child</option>
          <option>Diabetes</option>
        </Select>
      </FormControl>
    );
  }

  encounterTypesElement() {
    return (
      <FormControl fullWidth>
        <InputLabel>Encounter Type</InputLabel>
        <NoSsr>
          <Select
            options={this.state.encounterTypes || ["h1", "h2", "h3", "h4"]}
            onChange={this.onChangeEncounterField.bind(this)}
            id="encounterTypes"
            isMulti
          />
        </NoSsr>
      </FormControl>
    );
  }

  render() {
    const encounterTypes =
      this.state.formType === "Encounter" ||
      this.state.formType === "ProgramEncounter";
    const programBased =
      this.state.formType === "ProgramEncounter" ||
      this.state.formType === "ProgramExit" ||
      this.state.formType === "ProgramEnrolment";
    return (
      <div>
        {true && this.NewFormButton()}
        <Dialog
          fullWidth="true"
          maxWidth="sm"
          onClose={this.handleClose}
          aria-labelledby="customized-dialog-title"
          open={this.state.open}
        >
          <DialogTitle id="customized-dialog-title" onClose={this.handleClose}>
            New Form
            <IconButton style={{ float: "right" }} onClick={this.handleClose}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <form>
            <DialogContent dividers>
              <FormControl fullWidth>
                <InputLabel>Name</InputLabel>
                <Input
                  type="text"
                  id="formName"
                  name="name"
                  onChange={this.onChangeField.bind(this)}
                  required
                  fullWidth
                />
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Form Type</InputLabel>
                <Select
                  native
                  id="formTypeSelect"
                  name="formType"
                  onChange={this.onChangeField.bind(this)}
                >
                  <option value="" />
                  <option>IndividualProfile</option>
                  <option>Encounter</option>
                  <option>ProgramEncounter</option>
                  <option>ProgramEnrolment</option>
                  <option>ProgramExit</option>
                </Select>
              </FormControl>

              {programBased && this.programNameElement()}
              {encounterTypes && this.encounterTypesElement()}
            </DialogContent>
            <DialogActions>
              <Button color="primary" onClick={this.addFields.bind(this)}>
                Add
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </div>
    );
  }
}

export default NewFormModal;
