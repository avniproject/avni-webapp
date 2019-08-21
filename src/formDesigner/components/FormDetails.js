import React, { Component } from "react";
import _ from "lodash";
import axios from "axios";
import Grid from "@material-ui/core/Grid";
import FormElementGroup from "./FormElementGroup";
import Button from "@material-ui/core/Button";
import Breadcrumb from "./Breadcrumb";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";

class FormDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form: [],
      createFlag: true
    };
    this.btnGroupClick = this.btnGroupClick.bind(this);
    this.deleteGroup = this.deleteGroup.bind(this);
    this.btnGroupAdd = this.btnGroupAdd.bind(this);
    this.handleGroupElementChange = this.handleGroupElementChange.bind(this);
  }

  componentDidMount() {
    return axios
      .get(`/forms/export?formUUID=${this.props.match.params.formUUID}`)
      .then(response => response.data)
      .then(form => {
        _.forEach(form.formElementGroups, group => {
          group.groupId = (group.groupId || group.name).replace(/[^a-zA-Z0-9]/g, "_");
          group.collapse = true;
          group.formElements.forEach(fe => (fe.collapse = true));
        });
        let dataGroupFlag = this.countGroupElements(form);
        this.setState({ form: form, createFlag: dataGroupFlag });
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
      if (groupElement.voided === false) {
        groupFlag = false;
      }
    });
    return groupFlag;
  }
  // Group level events
  deleteGroup(index, elementIndex = -1) {
    if (elementIndex === -1) {
      this.setState(state => {
        const form = this.state.form;
        if (form.formElementGroups[index].newFlag === "true")
          form.formElementGroups.splice(index, 1);
        else form.formElementGroups[index].voided = true;
        this.setState({ createFlag: this.countGroupElements(form) });
        return form;
      });
    } else {
      this.setState(state => {
        const form = this.state.form;
        if (form.formElementGroups[index].formElements[elementIndex].newFlag === "true")
          form.formElementGroups[index].formElements.splice(elementIndex, 1);
        else form.formElementGroups[index].formElements[elementIndex].voided = true;

        return form;
      });
    }
  }

  renderGroups() {
    const formElements = [];

    _.forEach(this.state.form.formElementGroups, (group, index) => {
      if (group.voided === false)
        formElements.push(
          <FormElementGroup
            groupData={group}
            index={index}
            deleteGroup={this.deleteGroup}
            btnGroupAdd={this.btnGroupAdd}
            updateGroupData={this.handleGroupElementChange}
          />
        );
    });
    return formElements;
  }
  handleGroupElementChange(index, propertyName, value, elementIndex = -1) {
    const form = this.state.form;
    if (elementIndex === -1) {
      form.formElementGroups[index][propertyName] = value;
    } else {
      form.formElementGroups[index].formElements[elementIndex][propertyName] = value;
    }
    this.setState({ form });
  }

  btnGroupAdd(index, elementIndex = -1) {
    const form = this.state.form;
    if (elementIndex === -1) {
      form.formElementGroups.splice(index + 1, 0, {
        newFlag: "true",
        name: "",
        display: "",
        displayOrder: index + 1,
        voided: false,
        formElements: [
          { newFlag: "true", name: "", type: "", mandatory: "", voided: false, concept: {} }
        ]
      });
    } else {
      form.formElementGroups[index].formElements.splice(elementIndex + 1, 0, {
        newFlag: "true",
        name: "",
        type: "",
        voided: false,
        mandatory: "",
        concept: {}
      });
    }
    this.setState({
      form
    });
  }

  btnGroupClick() {
    this.btnGroupAdd(0);
    this.setState({ createFlag: false });
  }
  // END Group level Events

  render() {
    return (
      <ScreenWithAppBar appbarTitle={"Form Details"}>
        <Grid container justify="center">
          <Grid item sm={12}>
            <Breadcrumb location={this.props.location} />
            <div name="divGroup">
              {this.state.createFlag && (
                <Button variant="contained" color="primary" onClick={this.btnGroupClick.bind(this)}>
                  Add Group
                </Button>
              )
              //            <Fab color="primary" aria-label="add" onClick={this.btnGroupClick.bind(this)} size="small">
              //              <AddIcon />
              //            </Fab>
              }
              {this.renderGroups()}
            </div>
          </Grid>
        </Grid>
      </ScreenWithAppBar>
    );
  }
}

export default FormDetails;
