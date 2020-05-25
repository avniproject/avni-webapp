import React from "react";
import _, { isEqual } from "lodash";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import MuiExpansionPanel from "@material-ui/core/ExpansionPanel";
import MuiExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import MuiExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import Grid from "@material-ui/core/Grid";
import { FormControl, Input } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import { Draggable, Droppable } from "react-beautiful-dnd";

import FormElementWithAddButton from "./FormElementWithAddButton";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { TabContainer } from "../views/FormDetails";
import { FormElementGroupRule } from "./FormElementGroupRule";
import { ToolTip } from "../../common/components/ToolTip";

const useStyles = makeStyles(theme => ({
  parent: {
    paddingLeft: 0,
    paddingBottom: 30
  },
  root: {
    width: "100%"
  },
  rootError: {
    width: "100%",
    border: "1px solid red"
  },
  iconlay: {
    padding: "5px 20px 20px 0px"
  },
  questionCount: {
    paddingTop: "5px"
  },
  deleteicon: {
    padding: "9px 30px 20px 30px",
    marginTop: "-10px"
  },
  absolute: {
    position: "absolute",
    marginLeft: -35,
    marginTop: -5
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    flexShrink: 0
  },
  secondaryHeading: {
    flexBasis: "70%",
    fontSize: theme.typography.pxToRem(15)
    //color: theme.palette.text.secondary,
  },
  tabs: {
    minHeight: "26px",
    height: "26px"
  },
  tab: {
    minHeight: "26px",
    height: "26px"
  }
}));
const ExpansionPanel = withStyles({
  root: {
    "&$expanded": {
      margin: 0
    }
  },
  expanded: {}
})(MuiExpansionPanel);

const ExpansionPanelDetails = withStyles({
  root: {
    width: "100%",
    border: "1px solid #2196F3"
  }
})(MuiExpansionPanelDetails);

const ExpansionPanelSummary = withStyles({
  root: {
    paddingRight: 0,
    backgroundColor: "#dbdbdb",
    border: "1px solid #2196F3",
    minHeight: 56,
    "&$expanded": {
      minHeight: 56
    },
    "&$focused": {
      backgroundColor: "#dbdbdb"
    }
  },
  focused: {},
  content: {
    margin: "10px 0 0 0",
    "&$expanded": { margin: "10px 0 0 0" }
  },
  expanded: {}
})(MuiExpansionPanelSummary);

function FormElementGroup(props) {
  const classes = useStyles();
  const [hover, setHover] = React.useState(false);
  const [tabIndex, setTabIndex] = React.useState(0);
  const panel = "panel" + props.index.toString();
  let questionCount = 0;
  const eventCall = (index, key, value) => {
    props.handleGroupElementChange(index, key, value);
    props.handleGroupElementChange(index, "display", value);
  };

  _.forEach(props.groupData.formElements, (element, index) => {
    if (!element.voided) {
      questionCount = questionCount + 1;
    }
  });

  const handleDelete = event => {
    props.deleteGroup(props.index);
    event.stopPropagation();
    //props.deleteRecord(props.index);
  };

  const separateAddGroup = event => {
    props.btnGroupAdd(props.index);
  };

  const separateAddElement = event => {
    props.btnGroupAdd(props.index, 0);
  };
  const stopPropagation = e => e.stopPropagation();

  //Display/Hide Add Group button
  const hoverDisplayAddGroup = event => {
    setHover(true);
  };

  const hoverHideAddGroup = event => {
    setHover(false);
  };

  const renderFormElements = () => {
    const formElements = [];
    const displayOrderFormElements = props.groupData.formElements;

    _.forEach(displayOrderFormElements, (formElement, index) => {
      if (!formElement.voided) {
        let propsElement = {
          key: "Element" + props.index + "" + index,
          formElementData: formElement,
          groupIndex: props.index,
          index: index,
          btnGroupAdd: props.btnGroupAdd,
          identifierSources: props.identifierSources,
          handleGroupElementChange: props.handleGroupElementChange,
          deleteGroup: props.deleteGroup,
          updateConceptElementData: props.updateConceptElementData,
          handleGroupElementKeyValueChange: props.handleGroupElementKeyValueChange,
          handleExcludedAnswers: props.handleExcludedAnswers,
          updateSkipLogicRule: props.updateSkipLogicRule,
          handleModeForDate: props.handleModeForDate,
          handleRegex: props.handleRegex,
          handleConceptFormLibrary: props.handleConceptFormLibrary,
          availableDataTypes: props.availableDataTypes,
          onSaveInlineConcept: props.onSaveInlineConcept,
          handleInlineNumericAttributes: props.handleInlineNumericAttributes,
          handleInlineCodedConceptAnswers: props.handleInlineCodedConceptAnswers,
          onToggleInlineConceptCodedAnswerAttribute:
            props.onToggleInlineConceptCodedAnswerAttribute,
          onDeleteInlineConceptCodedAnswerDelete: props.onDeleteInlineConceptCodedAnswerDelete,
          handleInlineCodedAnswerAddition: props.handleInlineCodedAnswerAddition,
          onDragInlineCodedConceptAnswer: props.onDragInlineCodedConceptAnswer,
          entityName: props.entityName
        };
        formElements.push(
          <Draggable
            key={"Element" + props.index + "" + index}
            draggableId={"Group" + props.index + "Element" + index}
            index={index}
          >
            {provided => (
              <div
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                ref={provided.innerRef}
              >
                <FormElementWithAddButton {...propsElement} />
              </div>
            )}
          </Draggable>
        );
      }
    });
    return formElements;
  };

  return (
    <Draggable
      key={"Element" + props.index}
      draggableId={"Element" + props.index}
      index={props.index}
    >
      {provided => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className={classes.parent}
          onMouseEnter={hoverDisplayAddGroup}
          onMouseLeave={hoverHideAddGroup}
        >
          <Grid item>
            <Tabs
              style={{ background: "#2196f3", color: "white" }}
              classes={{ root: classes.tabs }}
              value={tabIndex}
              onChange={(event, value) => setTabIndex(value)}
            >
              <Tab label="Details" classes={{ root: classes.tab }} />
              <Tab label="Rules" classes={{ root: classes.tab }} />
            </Tabs>
            <TabContainer hidden={tabIndex !== 0} skipStyles={true}>
              <ExpansionPanel
                {...provided.dragHandleProps}
                TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
                expanded={props.groupData.expanded}
                className={props.groupData.error ? classes.rootError : classes.root}
                onChange={event =>
                  props.handleGroupElementChange(props.index, "expanded", !props.groupData.expanded)
                }
              >
                <ExpansionPanelSummary
                  aria-controls={panel + "bh-content"}
                  id={panel + "bh-header"}
                >
                  <div className={classes.iconlay}>
                    {props.groupData.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </div>

                  <Grid container sm={12} alignItems={"center"}>
                    <Grid item sm={8}>
                      <Typography component={"div"} className={classes.heading}>
                        {props.groupData.error && (
                          <div style={{ color: "red" }}>Please enter group name.</div>
                        )}
                        <FormControl fullWidth>
                          <Input
                            type="text"
                            placeholder="Group name"
                            disableUnderline={true}
                            onClick={stopPropagation}
                            name={"name" + panel}
                            value={props.groupData.name}
                            onChange={event => eventCall(props.index, "name", event.target.value)}
                            autoComplete="off"
                          />
                        </FormControl>
                      </Typography>
                    </Grid>

                    <Grid item sm={2}>
                      <Typography component={"div"} className={classes.questionCount}>
                        No. of questions : {questionCount}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid item sm={2}>
                    <IconButton
                      className={classes.deleteicon}
                      aria-label="delete"
                      onClick={handleDelete}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                  <Grid item sm={1}>
                    <ToolTip
                      toolTipKey={"APP_DESIGNER_FORM_ELEMENT_GROUP_NAME"}
                      onHover
                      displayPosition={"bottom"}
                    />
                  </Grid>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  <Typography component={"span"} className={classes.root}>
                    <Droppable droppableId={"Group" + props.index} type="task">
                      {provided => (
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                          {renderFormElements()}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>

                    {questionCount === 0 && (
                      <FormControl fullWidth>
                        <Button variant="contained" color="secondary" onClick={separateAddElement}>
                          Add Question
                        </Button>
                      </FormControl>
                    )}
                  </Typography>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            </TabContainer>
            <div hidden={tabIndex !== 1}>
              <FormElementGroupRule
                rule={props.groupData.rule}
                onChange={props.updateFormElementGroupRule}
                index={props.index}
              />
            </div>
          </Grid>
          {hover && (
            <Fab
              color="primary"
              aria-label="add"
              onClick={separateAddGroup}
              className={classes.absolute}
              size="small"
            >
              <AddIcon />
            </Fab>
          )}
        </div>
      )}
    </Draggable>
  );
}

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

export default React.memo(FormElementGroup, areEqual);
