import React, { Component } from "react";
import PropTypes from "prop-types";
import _, { cloneDeep } from "lodash";
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
import { FormControl } from "@material-ui/core";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import produce from "immer";

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
      name: "",
      errorMsg: "",
      saveCall: false,
      createFlag: true,
      activeTabIndex: 0,
      successAlert: false,
      defaultSnackbarStatus: true,
      detectBrowserCloseEvent: false
    };
    this.btnGroupClick = this.btnGroupClick.bind(this);
    this.deleteGroup = this.deleteGroup.bind(this);
    this.btnGroupAdd = this.btnGroupAdd.bind(this);
    this.handleGroupElementChange = this.handleGroupElementChange.bind(this);
    this.updateConceptElementData = this.updateConceptElementData.bind(this);
    this.validateForm = this.validateForm.bind(this);
  }

  onUpdateFormName = name => {
    // this function is because of we are using name in this component.
    this.setState({ name: name });
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
    return axios
      .get(`/forms/export?formUUID=${this.props.match.params.formUUID}`)
      .then(response => response.data)
      .then(form => {
        _.forEach(form.formElementGroups, group => {
          group.groupId = (group.groupId || group.name).replace(/[^a-zA-Z0-9]/g, "_");
          group.expanded = false;
          group.error = false;
          group.formElements.forEach(fe => {
            fe.expanded = false;
            fe.error = false;
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

  updateConceptElementData(index, propertyName, value, elementIndex = -1) {
    this.setState(
      produce(draft => {
        draft.form.formElementGroups[index].formElements[elementIndex]["concept"][
          propertyName
        ] = value;
      })
    );
  }

  onUpdateDragDropOrder = (
    groupSourceIndex,
    sourceElementIndex,
    destinationElementIndex,
    groupOrElement = 1,
    groupDestinationIndex
  ) => {
    if (groupOrElement === 1) {
      this.setState(
        produce(draft => {
          if (groupSourceIndex !== groupDestinationIndex) {
            let form = draft.form;
            const sourceElement = cloneDeep(
              form.formElementGroups[groupSourceIndex].formElements[sourceElementIndex]
            );
            sourceElement.uuid = UUID.v4();
            form.formElementGroups[groupDestinationIndex].formElements.splice(
              destinationElementIndex,
              0,
              sourceElement
            );

            form.formElementGroups[groupSourceIndex].formElements[sourceElementIndex].voided = true;
          } else {
            let form = draft.form;

            const sourceElement = form.formElementGroups[groupSourceIndex].formElements.splice(
              sourceElementIndex,
              1
            )[0];

            form.formElementGroups[groupSourceIndex].formElements.splice(
              destinationElementIndex,
              0,
              sourceElement
            );
          }

          draft.detectBrowserCloseEvent = true;
        })
      );
    } else {
      this.setState(
        produce(draft => {
          let form = draft.form;
          const sourceElement = form.formElementGroups.splice(sourceElementIndex, 1)[0];
          form.formElementGroups.splice(destinationElementIndex, 0, sourceElement);
          draft.detectBrowserCloseEvent = true;
        })
      );
    }
  };

  renderGroups() {
    const formElements = [];
    _.forEach(this.state.form.formElementGroups, (group, index) => {
      if (group.voided === false) {
        let propsGroup = {
          updateConceptElementData: this.updateConceptElementData,
          key: "Group" + index,
          groupData: group,
          index: index,
          deleteGroup: this.deleteGroup,
          btnGroupAdd: this.btnGroupAdd,
          onUpdateDragDropOrder: this.onUpdateDragDropOrder,
          handleGroupElementChange: this.handleGroupElementChange
        };
        formElements.push(<FormElementGroup {...propsGroup} />);
      }
    });
    return formElements;
  }

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
          mandatory: false,
          voided: false,
          expanded: true,
          concept: { name: "", dataType: "" }
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
    this.setState(
      produce(draft => {
        _.forEach(draft.form.formElementGroups, group => {
          group.error = false;
          group.expanded = false;
          if (group.voided === false && group.name.trim() === "") {
            group.error = true;
            flag = true;
          }
          let groupError = false;
          group.formElements.forEach(fe => {
            fe.error = false;
            fe.expanded = false;
            if (
              fe.voided === false &&
              (fe.name === "" ||
                fe.concept.dataType === "" ||
                fe.concept.dataType === "NA" ||
                (fe.concept.dataType === "Coded" && fe.type === ""))
            ) {
              fe.error = true;
              fe.expanded = true;
              flag = groupError = true;
            }
          });
          if (groupError || group.error) {
            group.expanded = true;
          }
        });
        if (flag) {
          errormsg =
            "There are empty fields or an invalid concept selected. Please find below highlighted groups or questions.";
        }
        draft.saveCall = !flag;
        draft.errorMsg = errormsg;
      })
    );
  }

  updateForm = event => {
    /*Have to deep clone state.form here as we want to modify this data before we send it to server.
     * Modifying this data will give an error as Immer freezes the state object for direct modifications.
     */
    let dataSend = cloneDeep(this.state.form);
    this.reOrderSequence(dataSend);
    _.forEach(dataSend.formElementGroups, (group, index) => {
      this.reOrderSequence(dataSend, index);
    });
    axios
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

  render() {
    const form = (
      <Grid container justify="center">
        <Grid item sm={12}>
          <Tabs
            style={{ background: "#2196f3", color: "white" }}
            value={this.state.activeTabIndex}
            onChange={this.onTabHandleChange}
          >
            <Tab label="Details" />
            <Tab label="Settings" />
          </Tabs>
          <TabContainer hidden={this.state.activeTabIndex !== 0}>
            <div name="divGroup">
              <Grid container item sm={12} direction="row-reverse">
                {this.state.createFlag && (
                  <Grid item sm={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={this.btnGroupClick}
                    >
                      Add Group
                    </Button>
                  </Grid>
                )}
                {!this.state.createFlag && (
                  <Grid item sm={2} style={{ paddingBottom: 20 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      onClick={this.validateForm}
                      disabled={!this.state.detectBrowserCloseEvent}
                    >
                      <SaveIcon />
                      &nbsp;Save
                    </Button>
                  </Grid>
                )}
                <Grid item sm={10}>
                  <b>Form : {this.state.name}</b>
                </Grid>
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
            </div>
          </TabContainer>
          <Grid container item sm={12} hidden={this.state.activeTabIndex !== 1}>
            <Grid item sm={8}>
              <NewFormModal
                name={this.state.name}
                onUpdateFormName={this.onUpdateFormName}
                uuid={this.props.match.params.formUUID}
                isCreateFrom={false}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
    return (
      <ScreenWithAppBar appbarTitle={"Form Details"} enableLeftMenuButton={true}>
        {this.state.dataLoaded ? form : <div>Loading</div>}
        {this.state.successAlert && (
          <CustomizedSnackbar
            message="Successfully updated the form"
            getDefaultSnackbarStatus={this.getDefaultSnackbarStatus}
            defaultSnackbarStatus={this.state.defaultSnackbarStatus}
          />
        )}
        {this.state.saveCall && this.updateForm()}
      </ScreenWithAppBar>
    );
  }
}

export default FormDetails;
