import { useState, memo } from "react";
import _, { get, isEqual } from "lodash";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Grid,
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
  FormControlLabel,
  styled
} from "@mui/material";
import { ExpandMore, ExpandLess, Delete, Add, Group, DragHandle } from "@mui/icons-material";
import { Draggable, Droppable } from "react-beautiful-dnd";
import FormElementWithAddButton from "./FormElementWithAddButton";
import { FormElementGroupRule } from "./FormElementGroupRule";
import { ToolTip } from "../../common/components/ToolTip";
import { ColourStyle } from "./ColourStyle";

const StyledParent = styled("div")({
  paddingLeft: 0,
  paddingBottom: 30
});

const StyledAccordion = styled(Accordion)(({ hasError }) => ({
  width: "100%",
  border: hasError ? "1px solid red" : undefined,
  "&.Mui-expanded": {
    margin: 0
  }
}));

const StyledAccordionSummary = styled(AccordionSummary)({
  paddingRight: 0,
  backgroundColor: "#dbdbdb",
  border: "1px solid #2196F3",
  paddingLeft: 0,
  minHeight: 56,
  "&.Mui-expanded": {
    minHeight: 56
  },
  "&.Mui-focused": {
    backgroundColor: "#dbdbdb"
  },
  "& .MuiAccordionSummary-content": {
    margin: 0,
    "&.Mui-expanded": {
      margin: 0
    }
  },
  "& .MuiAccordionSummary-icon": {
    marginHorizontal: "8px",
    display: "inline"
  }
});

const StyledDragHandler = styled("div")({
  height: 5
});

const StyledDragHandleContainer = styled("div")(({ show }) => ({
  display: show ? "block" : "none"
}));

const StyledGroupIcon = styled(Group)({
  marginLeft: 12,
  marginRight: 4
});

const StyledExpandIcon = styled(({ expanded, ...props }) => (expanded ? <ExpandLess {...props} /> : <ExpandMore {...props} />))({
  marginHorizontal: "8px",
  display: "inline"
});

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(15)
}));

const StyledQuestionCount = styled(Typography)({
  paddingTop: "5px"
});

const StyledTabs = styled(Tabs)({
  background: "#2196f3",
  color: "white",
  width: "100%",
  marginBottom: 24,
  height: 40,
  minHeight: "26px"
});

const StyledTab = styled(Tab)({
  minHeight: "26px",
  height: "26px"
});

const StyledErrorText = styled("div")({
  color: "red"
});

const StyledDetailsContainer = styled(Grid)({
  width: "100%",
  alignContent: "center",
  marginBottom: 8
});

const StyledFormControlLabel = styled(FormControlLabel)({
  marginLeft: 10
});

const StyledFlexContainer = styled("div")({
  display: "flex",
  flexDirection: "row"
});

const StyledFlexItem = styled("div")({
  flex: 0.2
});

const StyledFab = styled(Fab)({
  position: "absolute",
  marginLeft: -35,
  marginTop: -5
});

function FormElementGroup(props) {
  const [hover, setHover] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const panel = "panel" + props.index.toString();
  let questionCount = 0;

  const eventCall = (index, key, value) => {
    props.handleGroupElementChange(index, key, value);
    props.handleGroupElementChange(index, "display", value);
  };

  _.forEach(props.groupData.formElements, element => {
    if (!element.voided) {
      questionCount = questionCount + 1;
    }
  });

  const handleDelete = event => {
    props.deleteGroup(props.index);
    event.stopPropagation();
  };

  const separateAddGroup = () => {
    props.btnGroupAdd(props.index);
  };

  const separateAddElement = () => {
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

  const [dragGroup, setDragGroup] = useState(false);
  const disableGroup = props.disableGroup;

  const DragHandler = ({ dragHandleProps }) => (
    <StyledDragHandler {...dragHandleProps}>
      <StyledDragHandleContainer hidden={!dragGroup || disableGroup}>
        <DragHandle color="disabled" />
      </StyledDragHandleContainer>
    </StyledDragHandler>
  );

  return (
    <Draggable key={`Element${props.index}`} draggableId={`Element${props.index}`} index={props.index} isDragDisabled={disableGroup}>
      {provided => (
        <StyledParent
          {...provided.draggableProps}
          ref={provided.innerRef}
          onMouseEnter={hoverDisplayAddGroup}
          onMouseLeave={hoverHideAddGroup}
        >
          <Grid>
            <StyledAccordion
              TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
              expanded={props.groupData.expanded}
              hasError={props.groupData.error}
              onChange={() => props.handleGroupElementChange(props.index, "expanded", !props.groupData.expanded)}
            >
              <StyledAccordionSummary aria-controls={`${panel}bh-content`} id={`${panel}bh-header`} {...provided.dragHandleProps}>
                <Grid container direction="row">
                  <Grid container sx={{ alignItems: "center", justifyContent: "center" }}>
                    <DragHandler dragHandleProps={provided.dragHandleProps} />
                  </Grid>
                  <Grid container sx={{ alignItems: "center" }} size={{ sm: 12 }}>
                    <Grid size={{ sm: 1 }}>
                      <Tooltip title="Grouped Questions">
                        <StyledGroupIcon />
                      </Tooltip>
                      <StyledExpandIcon expanded={props.groupData.expanded} />
                    </Grid>
                    <Grid size={{ sm: 6 }}>
                      <StyledTypography>
                        {props.groupData.errorMessage && props.groupData.errorMessage.name && (
                          <StyledErrorText>Please enter Page name.</StyledErrorText>
                        )}
                        {get(props.groupData, "errorMessage.ruleError") && (
                          <StyledErrorText>Please check the rule validation errors</StyledErrorText>
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
                      </StyledTypography>
                    </Grid>
                    {props.groupData.timed && (
                      <Grid size={{ sm: 3 }}>
                        <Grid container direction="row">
                          <Grid size={{ sm: 6 }}>
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
                          <Grid size={{ sm: 6 }}>
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
                    <Grid size={{ sm: props.groupData.timed ? 1 : 3 }}>
                      <StyledQuestionCount component="div">{questionCount} questions</StyledQuestionCount>
                    </Grid>
                    <Grid size={{ sm: 1 }}>
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
                  <StyledTabs value={tabIndex} onChange={(event, value) => setTabIndex(value)}>
                    <StyledTab label="Details" />
                    <StyledTab label="Rules" />
                  </StyledTabs>
                  <StyledDetailsContainer hidden={tabIndex !== 0}>
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
                    <StyledFlexContainer>
                      <StyledFlexItem>
                        <StyledFormControlLabel
                          control={
                            <Checkbox
                              id="isTimed"
                              checked={props.groupData.timed}
                              onChange={event => props.handleGroupElementChange(props.index, "timed", event.target.checked)}
                            />
                          }
                          label="Timed Page"
                        />
                      </StyledFlexItem>
                      <StyledFlexItem>
                        <ColourStyle
                          label="Text colour"
                          colour={props.groupData.textColour}
                          onChange={colour => props.handleGroupElementChange(props.index, "textColour", colour)}
                          title="APP_DESIGNER_GROUP_TEXT_COLOUR"
                        />
                      </StyledFlexItem>
                      <StyledFlexItem>
                        <ColourStyle
                          label="Background colour"
                          colour={props.groupData.backgroundColour}
                          onChange={colour => props.handleGroupElementChange(props.index, "backgroundColour", colour)}
                          title="APP_DESIGNER_GROUP_BACKGROUND_COLOUR"
                        />
                      </StyledFlexItem>
                    </StyledFlexContainer>
                  </StyledDetailsContainer>
                  <Grid hidden={tabIndex !== 1}>
                    <FormElementGroupRule groupData={props.groupData} disable={disableGroup} {...props} />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </StyledAccordion>
          </Grid>
          {hover && (
            <StyledFab color="primary" aria-label="add" onClick={separateAddGroup} size="small" disabled={disableGroup}>
              <Add />
            </StyledFab>
          )}
        </StyledParent>
      )}
    </Draggable>
  );
}

export default memo(FormElementGroup, isEqual);
