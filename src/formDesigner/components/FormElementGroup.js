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
import GroupIcon from "@material-ui/icons/ViewList";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { FormElementGroupRule } from "./FormElementGroupRule";
import { ToolTip } from "../../common/components/ToolTip";
import Tooltip from "@material-ui/core/Tooltip";
import FormHelperText from "@material-ui/core/FormHelperText";
import TextField from "@material-ui/core/TextField";

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
    flex: 1,
    alignItems: "center"
  },
  questionCount: {
    paddingTop: "5px"
  },

  absolute: {
    position: "absolute",
    marginLeft: -35,
    marginTop: -5
  },
  heading: {
    fontSize: theme.typography.pxToRem(15)
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
  },
  formElementGroupInputText: {
    lineHeight: "56px"
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
    border: "1px solid #2196F3",
    paddingHorizontal: 0
  }
})(MuiExpansionPanelDetails);

const ExpansionPanelSummary = withStyles({
  root: {
    paddingRight: 0,
    backgroundColor: "#dbdbdb",
    border: "1px solid #2196F3",
    paddingLeft: 0,
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
    margin: "0",
    "&$expanded": { margin: "0" }
  },
  expanded: {},
  icon: {
    marginHorizontal: "8px",
    display: "inline"
  }
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
            <ExpansionPanel
              {...provided.dragHandleProps}
              TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
              expanded={props.groupData.expanded}
              className={props.groupData.error ? classes.rootError : classes.root}
              onChange={event =>
                props.handleGroupElementChange(props.index, "expanded", !props.groupData.expanded)
              }
            >
              <ExpansionPanelSummary aria-controls={panel + "bh-content"} id={panel + "bh-header"}>
                <Grid container sm={12} alignItems={"center"}>
                  <Grid item sm={1}>
                    <Tooltip title={"Grouped Questions"}>
                      <GroupIcon style={{ marginLeft: 12, marginRight: 4 }} />
                    </Tooltip>
                    {props.groupData.expanded ? (
                      <ExpandLessIcon classes={{ root: classes.icon }} />
                    ) : (
                      <ExpandMoreIcon classes={{ root: classes.icon }} />
                    )}
                  </Grid>
                  <Grid item sm={6}>
                    <Typography className={classes.heading}>
                      {props.groupData.error && (
                        <div style={{ color: "red" }}>Please enter group name.</div>
                      )}
                      <FormControl fullWidth>
                        <Input
                          classes={{ input: classes.formElementGroupInputText }}
                          type="text"
                          placeholder="Group name"
                          name={"name" + panel}
                          disableUnderline={true}
                          onClick={stopPropagation}
                          value={props.groupData.name}
                          onChange={event => eventCall(props.index, "name", event.target.value)}
                          autoComplete="off"
                        />
                      </FormControl>
                    </Typography>
                  </Grid>
                  <Grid item sm={4}>
                    <Typography component={"div"} className={classes.questionCount}>
                      {questionCount} questions
                    </Typography>
                  </Grid>
                  <Grid item sm={1}>
                    <IconButton aria-label="delete" onClick={handleDelete}>
                      <DeleteIcon />
                    </IconButton>
                    <ToolTip
                      toolTipKey={"APP_DESIGNER_FORM_ELEMENT_GROUP_NAME"}
                      onHover
                      displayPosition={"bottom"}
                    />
                  </Grid>
                </Grid>
              </ExpansionPanelSummary>
              <MuiExpansionPanelDetails style={{ padding: 0, paddingLeft: 0, paddingRight: 0 }}>
                <Grid direction={"column"} style={{ width: "100%" }}>
                  <Tabs
                    style={{
                      background: "#2196f3",
                      color: "white",
                      width: "100%",
                      marginBottom: 24,
                      height: 40
                    }}
                    classes={{ root: classes.tabs }}
                    value={tabIndex}
                    onChange={(event, value) => setTabIndex(value)}
                  >
                    <Tab label="Details" classes={{ root: classes.tab }} />
                    <Tab label="Rules" classes={{ root: classes.tab }} />
                  </Tabs>
                  <Grid
                    hidden={tabIndex !== 0}
                    style={{ width: "100%", alignContent: "center", marginBottom: 8 }}
                  >
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
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={separateAddElement}
                          >
                            Add Question
                          </Button>
                        </FormControl>
                      )}
                    </Typography>
                  </Grid>
                  <Grid hidden={tabIndex !== 1}>
                    <FormElementGroupRule
                      rule={props.groupData.rule}
                      onChange={props.updateFormElementGroupRule}
                      index={props.index}
                    />
                  </Grid>
                </Grid>
              </MuiExpansionPanelDetails>
            </ExpansionPanel>
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
