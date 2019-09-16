import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import axios from "axios";
import Grid from "@material-ui/core/Grid";
import FormElementGroup from "../components/FormElementGroup";
import Button from "@material-ui/core/Button";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import { default as UUID } from "uuid";
import NewFormModal from "../components/NewFormModal";
import SaveIcon from "@material-ui/icons/Save";
import CustomizedSnackbar from "../components/CustomizedSnackbar";

function TabContainer(props) {
  return (
    <Typography {...props} component="div" style={{ padding: 8 * 3 }}>
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
      createFlag: true,
      activeTabIndex: 0,
      successAlert: false
    };
    this.btnGroupClick = this.btnGroupClick.bind(this);
    this.deleteGroup = this.deleteGroup.bind(this);
    this.btnGroupAdd = this.btnGroupAdd.bind(this);
    this.handleGroupElementChange = this.handleGroupElementChange.bind(this);
    this.updateConceptElementData = this.updateConceptElementData.bind(this);
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
      this.setState(state => {
        let form = Object.assign({}, state.form);
        if (form.formElementGroups[index].newFlag === "true") {
          form.formElementGroups.splice(index, 1);
          this.reOrderSequence(form);
        } else form.formElementGroups[index].voided = true;
        this.setState({ createFlag: this.countGroupElements(form) });
        return form;
      });
    } else {
      this.setState(state => {
        let form = Object.assign({}, state.form);
        if (form.formElementGroups[index].formElements[elementIndex].newFlag === "true") {
          form.formElementGroups[index].formElements.splice(elementIndex, 1);
          this.reOrderSequence(form, index);
        } else form.formElementGroups[index].formElements[elementIndex].voided = true;

        return form;
      });
    }
  }
  updateConceptElementData(index, propertyName, value, elementIndex = -1) {
    this.setState(prevState => {
      let form = Object.assign({}, prevState.form);
      form.formElementGroups[index].formElements[elementIndex]["concept"][propertyName] = value;
      return { form };
    });
  }

  renderGroups() {
    const formElements = [];
    _.forEach(this.state.form.formElementGroups, (group, index) => {
      if (group.voided === false)
        formElements.push(
          <FormElementGroup
            updateConceptElementData={this.updateConceptElementData}
            key={index}
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
    this.setState(prevState => {
      let form = Object.assign({}, prevState.form);
      if (elementIndex === -1) {
        form.formElementGroups[index][propertyName] = value;
      } else {
        form.formElementGroups[index].formElements[elementIndex][propertyName] = value;
      }
      return { form };
    });
  }

  btnGroupAdd(index, elementIndex = -1) {
    this.setState(prevState => {
      let form = Object.assign({}, prevState.form);
      const formElement_temp = {
        uuid: UUID.v4(),
        displayOrder: -1,
        newFlag: "true",
        name: "",
        type: "",
        mandatory: false,
        voided: false,
        concept: { name: "", dataType: "" }
      };
      if (elementIndex === -1) {
        form.formElementGroups.splice(index + 1, 0, {
          uuid: UUID.v4(),
          newFlag: "true",
          displayOrder: -1,
          name: "",
          display: "",
          voided: false,
          formElements: [formElement_temp]
        });
        this.reOrderSequence(form);
      } else {
        form.formElementGroups[index].formElements.splice(elementIndex + 1, 0, formElement_temp);
        this.reOrderSequence(form, index);
      }
      return { form };
    });
  }

  btnGroupClick() {
    this.btnGroupAdd(0);
    this.setState({ createFlag: false });
  }
  // END Group level Events

  handleChange = (event, value) => {
    this.setState({ activeTabIndex: value });
  };

  updateForm = event => {
    let dataSend = this.state.form;
    axios
      .post("/forms", dataSend)
      .then(response => {
        if (response.status === 200) {
          this.setState({ successAlert: true });
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  render() {
    const encounterType = this.state.form.encounterTypes ? this.state.form.encounterTypes[0] : "";
    return (
      <ScreenWithAppBar appbarTitle={"Form Details"} enableLeftMenuButton={true}>
        <Grid container justify="center">
          <Grid item sm={12}>
            <Tabs
              style={{ background: "#2196f3", color: "white" }}
              value={this.state.activeTabIndex}
              onChange={this.handleChange.bind(this)}
            >
              <Tab label="Details" />
              <Tab label="Settings" />
            </Tabs>
            {this.state.activeTabIndex === 0 && (
              <TabContainer>
                <div name="divGroup">
                  <Grid container item sm={12} direction="row-reverse">
                    {this.state.createFlag && (
                      <Grid item sm={2}>
                        <Button
                          fullWidth
                          variant="contained"
                          color="primary"
                          onClick={this.btnGroupClick.bind(this)}
                        >
                          Add Group
                        </Button>
                      </Grid>
                    )
                    //            <Fab color="primary" aria-label="add" onClick={this.btnGroupClick.bind(this)} size="small">
                    //              <AddIcon />
                    //            </Fab>
                    }
                    {!this.state.createFlag && (
                      <Grid item sm={2} style={{ paddingBottom: 20 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          color="secondary"
                          onClick={this.updateForm.bind(this)}
                        >
                          <SaveIcon />
                          &nbsp;Save
                        </Button>
                      </Grid>
                    )}
                    <Grid item sm={10}>
                      <b>Form : {this.state.form.name}</b>
                    </Grid>
                  </Grid>
                  {this.renderGroups()}
                </div>
              </TabContainer>
            )}

            {this.state.activeTabIndex === 1 && (
              <div style={{ marginRight: "60%", marginTop: "2%" }}>
                <NewFormModal
                  formProperties={this.state.form}
                  encounterType={encounterType}
                  isCreateFrom={false}
                />
              </div>
            )}
          </Grid>
        </Grid>
        {this.state.successAlert && (
          <CustomizedSnackbar message="Successfully updated the form" url="/forms" />
        )}
      </ScreenWithAppBar>
    );
  }
}

export default FormDetails;
