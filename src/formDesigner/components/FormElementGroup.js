import React from "react";
import _, { get, isEqual } from "lodash";
import { withStyles, makeStyles } from "@mui/styles";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  GridLegacy as Grid,
  Checkbox,
  FormControl,
  Input,
  Button,
  IconButton,
  Fab,
  Tabs,
  Tab,
  Tooltip,
  TextField,
  FormControlLabel
} from "@mui/material";
import { ExpandMore, ExpandLess, Delete, Add, Group, DragHandle } from "@mui/icons-material";
import { Draggable, Droppable } from "react-beautiful-dnd";
import FormElementWithAddButton from "./FormElementWithAddButton";
import { FormElementGroupRule } from "./FormElementGroupRule";
import { ToolTip } from "../../common/components/ToolTip";
import { ColourStyle } from "./ColourStyle";

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

export const StyledAccordion = withStyles({
  root: {
    "&$expanded": {
      margin: 0
    }
  },
  expanded: {}
})(Accordion);

export const StyledAccordionSummary = withStyles({
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
})(AccordionSummary);

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
  };

  const separateAddGroup = event => {
    props.btnGroupAdd(props.index);
  };

  const separateAddElement = event => {
    props.btnGroupAdd(props.index, 0);
  };

  const stopPropagation = e => e.stopPropagation();

  const hoverDisplayAddGroup = () => {
    setHover(true);
    setDragGroup(true);
  };

  const hoverHideAddGroup = () => {
    setHover(false);
    setDragGroup(false);
  };

  const renderFormElements = () => {
    const formElements = [];
    const displayOrderFormElements = props.groupData.formElements;

    _.forEach(displayOrderFormElements, (formElement, index) => {
      if (!formElement.voided && _.isNil(formElement.parentFormElementUuid)) {
        let propsElement = {
          key: `Element${props.index}${index}`,
          formElementData: formElement,
          groupIndex: props.index,
          index: index,
          btnGroupAdd: props.btnGroupAdd,
          identifierSources: props.identifierSources,
          groupSubjectTypes: props.groupSubjectTypes,
          handleGroupElementChange: props.handleGroupElementChange,
          deleteGroup: props.deleteGroup,
          updateConceptElementData: props.updateConceptElementData,
          handleGroupElementKeyValueChange: props.handleGroupElementKeyValueChange,
          handleExcludedAnswers: props.handleExcludedAnswers,
          updateSkipLogicRule: props.updateSkipLogicRule,
          updateSkipLogicJSON: props.updateSkipLogicJSON,
          handleModeForDate: props.handleModeForDate,
          handleRegex: props.handleRegex,
          handleConceptFormLibrary: props.handleConceptFormLibrary,
          availableDataTypes: props.availableDataTypes,
          onSaveInlineConcept: props.onSaveInlineConcept,
          handleInlineNumericAttributes: props.handleInlineNumericAttributes,
          handleInlineCodedConceptAnswers: props.handleInlineCodedConceptAnswers,
          onToggleInlineConceptCodedAnswerAttribute: props.onToggleInlineConceptCodedAnswerAttribute,
          onDeleteInlineConceptCodedAnswerDelete: props.onDeleteInlineConceptCodedAnswerDelete,
          onMoveUp: props.onMoveUp,
          onMoveDown: props.onMoveDown,
          onAlphabeticalSort: props.onAlphabeticalSort,
          handleInlineCodedAnswerAddition: props.handleInlineCodedAnswerAddition,
          handleInlineLocationAttributes: props.handleInlineLocationAttributes,
          handleInlineSubjectAttributes: props.handleInlineSubjectAttributes,
          handleInlinePhoneNumberAttributes: props.handleInlinePhoneNumberAttributes,
          entityName: props.entityName,
          disableFormElement: props.disableGroup,
          subjectType: props.subjectType,
          form: props.form,
          handleInlineEncounterAttributes: props.handleInlineEncounterAttributes
        };
        formElements.push(
          <Draggable
            key={`Element${props.index}${index}`}
            draggableId={`Group${props.index}Element${index}`}
            index={index}
            isDragDisabled={props.disableGroup}
          >
            {provided => (
              <div {...provided.draggableProps} ref={provided.innerRef}>
                <FormElementWithAddButton {...propsElement} dragHandleProps={provided.dragHandleProps} />
              </div>
            )}
          </Draggable>
        );
      }
    });
    return formElements;
  };

  const [dragGroup, setDragGroup] = React.useState(false);
  const disableGroup = props.disableGroup;

  const DragHandler = props => (
    <div style={{ height: 5 }} {...props}>
      <div hidden={!dragGroup || disableGroup}>
        <DragHandle color="disabled" />
      </div>
    </div>
  );

  return (
    <Draggable key={`Element${props.index}`} draggableId={`Element${props.index}`} index={props.index} isDragDisabled={disableGroup}>
      {provided => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className={classes.parent}
          onMouseEnter={hoverDisplayAddGroup}
          onMouseLeave={hoverHideAddGroup}
        >
          <Grid item>
            <StyledAccordion
              TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
              expanded={props.groupData.expanded}
              className={props.groupData.error ? classes.rootError : classes.root}
              onChange={event => props.handleGroupElementChange(props.index, "expanded", !props.groupData.expanded)}
            >
              <StyledAccordionSummary aria-controls={`${panel}bh-content`} id={`${panel}bh-header`} {...provided.dragHandleProps}>
                <Grid container direction="row">
                  <Grid
                    container
                    item
                    sx={{
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <DragHandler />
                  </Grid>
                  <Grid
                    container
                    item
                    sm={12}
                    sx={{
                      alignItems: "center"
                    }}
                  >
                    <Grid item sm={1}>
                      <Tooltip title="Grouped Questions">
                        <Group style={{ marginLeft: 12, marginRight: 4 }} />
                      </Tooltip>
                      {props.groupData.expanded ? <ExpandLess className={classes.icon} /> : <ExpandMore className={classes.icon} />}
                    </Grid>
                    <Grid item sm={6}>
                      <Typography className={classes.heading}>
                        {props.groupData.errorMessage && props.groupData.errorMessage.name && (
                          <div style={{ color: "red" }}>Please enter Page name.</div>
                        )}
                        {get(props.groupData, "errorMessage.ruleError") && (
                          <div style={{ color: "red" }}>Please check the rule validation errors</div>
                        )}
                        <FormControl fullWidth>
                          <Input
                            type="text"
                            placeholder="Page name"
                            name={`name${panel}`}
                            disableUnderline
                            onClick={stopPropagation}
                            value={props.groupData.name}
                            onChange={event => eventCall(props.index, "name", event.target.value)}
                            autoComplete="off"
                            disabled={disableGroup}
                          />
                        </FormControl>
                      </Typography>
                    </Grid>
                    {props.groupData.timed && (
                      <Grid item sm={3}>
                        <Grid container direction="row">
                          <Grid item sm={6}>
                            <TextField
                              type="number"
                              label="Start time (Seconds)"
                              value={props.groupData.startTime}
                              InputProps={{ disableUnderline: true }}
                              onClick={stopPropagation}
                              onChange={event => props.handleGroupElementChange(props.index, "startTime", event.target.value)}
                              autoComplete="off"
                              disabled={disableGroup}
                            />
                          </Grid>
                          <Grid item sm={6}>
                            <TextField
                              type="number"
                              label="Stay time (Seconds)"
                              value={props.groupData.stayTime}
                              InputProps={{ disableUnderline: true }}
                              onClick={stopPropagation}
                              onChange={event => props.handleGroupElementChange(props.index, "stayTime", event.target.value)}
                              autoComplete="off"
                              disabled={disableGroup}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    )}
                    <Grid item sm={props.groupData.timed ? 1 : 3}>
                      <Typography component="div" className={classes.questionCount}>
                        {questionCount} questions
                      </Typography>
                    </Grid>
                    <Grid item sm={1}>
                      <IconButton aria-label="delete" onClick={handleDelete} disabled={disableGroup} size="large">
                        <Delete />
                      </IconButton>
                      <ToolTip title="APP_DESIGNER_FORM_ELEMENT_GROUP_NAME" displayPosition="bottom" />
                    </Grid>
                  </Grid>
                </Grid>
              </StyledAccordionSummary>
              <AccordionDetails style={{ padding: 0 }}>
                <Grid direction="column" style={{ width: "100%" }}>
                  <Tabs
                    style={{
                      background: "#2196f3",
                      color: "white",
                      width: "100%",
                      marginBottom: 24,
                      height: 40
                    }}
                    className={classes.tabs}
                    value={tabIndex}
                    onChange={(event, value) => setTabIndex(value)}
                  >
                    <Tab label="Details" className={classes.tab} />
                    <Tab label="Rules" className={classes.tab} />
                  </Tabs>
                  <Grid hidden={tabIndex !== 0} style={{ width: "100%", alignContent: "center", marginBottom: 8 }}>
                    <Typography component="span" className={classes.root}>
                      <Droppable droppableId={`Group${props.index}`} type="task">
                        {provided => (
                          <div ref={provided.innerRef} {...provided.droppableProps}>
                            {renderFormElements()}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                      {questionCount === 0 && (
                        <FormControl fullWidth>
                          <Button variant="contained" color="secondary" onClick={separateAddElement} disabled={disableGroup}>
                            Add Question
                          </Button>
                        </FormControl>
                      )}
                      <div style={{ display: "flex", flexDirection: "row" }}>
                        <div style={{ flex: 0.2 }}>
                          <FormControlLabel
                            style={{ marginLeft: 10 }}
                            control={
                              <Checkbox
                                id="isTimed"
                                checked={props.groupData.timed}
                                onChange={event => props.handleGroupElementChange(props.index, "timed", event.target.checked)}
                              />
                            }
                            label="Timed Page"
                          />
                        </div>
                        <div style={{ flex: 0.2 }}>
                          <ColourStyle
                            label="Text colour"
                            colour={props.groupData.textColour}
                            onChange={colour => props.handleGroupElementChange(props.index, "textColour", colour)}
                            title="APP_DESIGNER_GROUP_TEXT_COLOUR"
                          />
                        </div>
                        <div style={{ flex: 0.2 }}>
                          <ColourStyle
                            label="Background colour"
                            colour={props.groupData.backgroundColour}
                            onChange={colour => props.handleGroupElementChange(props.index, "backgroundColour", colour)}
                            title="APP_DESIGNER_GROUP_BACKGROUND_COLOUR"
                          />
                        </div>
                      </div>
                    </Typography>
                  </Grid>
                  <Grid hidden={tabIndex !== 1}>
                    <FormElementGroupRule groupData={props.groupData} disable={disableGroup} {...props} />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </StyledAccordion>
          </Grid>
          {hover && (
            <Fab
              color="primary"
              aria-label="add"
              onClick={separateAddGroup}
              className={classes.absolute}
              size="small"
              disabled={disableGroup}
            >
              <Add />
            </Fab>
          )}
        </div>
      )}
    </Draggable>
  );
}
export default React.memo(FormElementGroup, isEqual);
