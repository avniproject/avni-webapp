import React, { Component } from "react";
import TagsInput from "react-tagsinput";

export function NewFormButton() {
  return (
    <div className="row justify-content-end">
      <div className="col-1">
        <nav className="navbar float-right">
          <form className="form-inline">
            <button
              className="btn btn-primary"
              data-toggle="modal"
              data-target="#newFormModal"
              type="button"
            >
              New Form
            </button>
          </form>
        </nav>
      </div>
    </div>
  );
}

class NewFormModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      formType: "IndividualProfile",
      programName: "Mother"
    };
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

  programNameElement() {
    return (
      <div className="form-group">
        <label htmlFor="programName">Program Name</label>
        <select
          className="form-control"
          id="programNameSelect"
          name="programName"
          onChange={this.onChangeField.bind(this)}
        >
          <option>Mother</option>
          <option>Child</option>
          <option>Diabetes</option>
        </select>
      </div>
    );
  }

  encounterTypesElement() {
    return (
      <div className="form-group">
        <label htmlFor="encounterTypes">Encounter Type</label>
        <TagsInput
          value={this.state.encounterTypes || []}
          onChange={this.onChangeEncounterField.bind(this)}
          id="encounterTypes"
          inputProps={{ placeholder: "" }}
        />
      </div>
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
      <div
        className="modal fade"
        id="newFormModal"
        role="dialog"
        aria-labelledby="newFormModalTitle"
        aria-hidden="true"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="newFormModalTitle">
                New Form
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <form>
              <div className="modal-body">
                <div className="form-group has-danger">
                  <label htmlFor="formName">Name</label>
                  <input
                    type="text"
                    className="form-control form-control-danger"
                    id="formName"
                    aria-describedby="formNameHelp"
                    name="name"
                    placeholder="Enter form name"
                    onChange={this.onChangeField.bind(this)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="formType">Form Type</label>
                  <select
                    className="form-control"
                    id="formTypeSelect"
                    name="formType"
                    onChange={this.onChangeField.bind(this)}
                  >
                    <option>IndividualProfile</option>
                    <option>Encounter</option>
                    <option>ProgramEncounter</option>
                    <option>ProgramEnrolment</option>
                    <option>ProgramExit</option>
                  </select>
                </div>
                {programBased && this.programNameElement()}
                {encounterTypes && this.encounterTypesElement()}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  data-dismiss="modal"
                  className="btn btn-primary btn-block"
                  onClick={this.addFields.bind(this)}
                >
                  Add Fields
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default NewFormModal;
