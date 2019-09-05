import React, { Component } from "react";
import PropTypes from "prop-types";

import _ from "lodash";
import axios from "axios";
import Grid from "@material-ui/core/Grid";
import FormElementGroup from "./FormElementGroup";
import Button from "@material-ui/core/Button";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import FormSettings from "./FormSettings";

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
      activeTabIndex: 0
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
    const formElement_temp = {
      newFlag: "true",
      name: "",
      type: "",
      mandatory: false,
      voided: false,
      concept: {}
    };
    if (elementIndex === -1) {
      form.formElementGroups.splice(index + 1, 0, {
        newFlag: "true",
        name: "",
        display: "",
        displayOrder: index + 1,
        voided: false,
        formElements: [formElement_temp]
      });
    } else {
      form.formElementGroups[index].formElements.splice(elementIndex + 1, 0, formElement_temp);
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

  handleChange = (event, value) => {
    this.setState({ activeTabIndex: value });
  };

  render() {
    return (
      <ScreenWithAppBar appbarTitle={"Form Details"} enableLeftMenuButton={true}>
        <Grid container justify="center">
          <Grid item sm={12}>
            <Tabs value={this.state.activeTabIndex} onChange={this.handleChange.bind(this)}>
              <Tab label="Details" />
              <Tab label="Settings" />
            </Tabs>
            {this.state.activeTabIndex === 0 && (
              <TabContainer>
                <div name="divGroup">
                  {this.state.createFlag && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={this.btnGroupClick.bind(this)}
                    >
                      Add Group
                    </Button>
                  )
                  //            <Fab color="primary" aria-label="add" onClick={this.btnGroupClick.bind(this)} size="small">
                  //              <AddIcon />
                  //            </Fab>
                  }
                  {this.renderGroups()}
                </div>
              </TabContainer>
            )}
            {this.state.activeTabIndex === 1 && <FormSettings formProperties={this.state.form} />}
          </Grid>
        </Grid>
      </ScreenWithAppBar>
    );
  }
}

export default FormDetails;
