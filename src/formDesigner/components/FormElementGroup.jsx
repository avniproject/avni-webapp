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
  FormControlLabel,
  styled,
  useTheme,
} from "@mui/material";
import {
  ExpandMore,
  ExpandLess,
  Delete,
  Add,
  DragHandle,
  ViewList,
} from "@mui/icons-material";
import { Draggable, Droppable } from "react-beautiful-dnd";
import FormElementWithAddButton from "./FormElementWithAddButton";
import { FormElementGroupRule } from "./FormElementGroupRule";
import { ToolTip } from "../../common/components/ToolTip";
import { ColourStyle } from "./ColourStyle";

const StyledParent = styled("div")(({ theme }) => ({
  paddingLeft: 0,
  paddingBottom: theme.spacing(4),
}));

const StyledAccordion = styled(Accordion)(({ hasError, theme }) => ({
  border: hasError ? `1px solid ${theme.palette.error.main}` : undefined,
  "&.Mui-expanded": {
    margin: 0,
  },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  position: "relative",
  backgroundColor: "#dbdbdb",
  paddingLeft: 0,
  paddingRight: 0,
  minHeight: 56,
  "&.Mui-expanded": {
    minHeight: 56,
  },
  "&.Mui-focused": {
    backgroundColor: "#dbdbdb",
  },
  "& .MuiAccordionSummary-content": {
    margin: theme.spacing(1),
    "&.Mui-expanded": {
      margin: theme.spacing(1),
    },
  },
  "& .MuiAccordionSummary-expandIconWrapper": {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    display: "inline",
  },
}));

const StyledDragHandler = styled("div")(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(0.5),
  left: "50%",
  transform: "translateX(-50%)",
  height: 24,
  width: 24,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledDragHandleContainer = styled("div", {
  shouldForwardProp: (prop) => prop !== "show",
})(({ show }) => ({
  display: show ? "block" : "none",
}));

const StyledGroupIcon = styled(ViewList)(({ theme }) => ({
  marginLeft: theme.spacing(0.75),
  marginRight: theme.spacing(0.25),
}));

const StyledExpandIcon = styled(({ expanded, ...props }) =>
  expanded ? <ExpandLess {...props} /> : <ExpandMore {...props} />,
)(({ theme }) => ({
  marginLeft: theme.spacing(0.25),
  marginRight: theme.spacing(0.75),
  display: "inline",
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(15),
}));

const StyledQuestionCount = styled(Typography)(({ theme }) => ({
  paddingTop: theme.spacing(0.625),
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  background: "#2196f3",
  color: "white",
  width: "100%",
  marginBottom: theme.spacing(3),
  height: 40,
  minHeight: "26px",
  "& .MuiTabs-indicator": {
    backgroundColor: "#fff",
  },
}));

const StyledErrorText = styled("div")(({ theme }) => ({
  color: theme.palette.error.main,
}));

const StyledDetailsContainer = styled(Grid)(({ theme }) => ({
  width: "100%",
  alignContent: "center",
  marginBottom: theme.spacing(1),
}));

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  marginLeft: theme.spacing(1.25),
}));

const StyledFlexContainer = styled("div")({
  display: "flex",
  flexDirection: "row",
});

const StyledFlexItem = styled("div")({
  flex: 0.2,
});

const StyledFab = styled(Fab)(({ theme }) => ({
  position: "absolute",
  marginLeft: theme.spacing(-4.375),
  marginTop: theme.spacing(-0.625),
}));

function FormElementGroup(props) {
  const [hover, setHover] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const panel = "panel" + props.index.toString();
  let questionCount = 0;
  const theme = useTheme();
  const eventCall = (index, key, value) => {
    props.handleGroupElementChange(index, key, value);
    props.handleGroupElementChange(index, "display", value);
  };

  _.forEach(props.groupData.formElements, (element) => {
    if (!element.voided) {
      questionCount = questionCount + 1;
    }
  });

  const handleDelete = (event) => {
    props.deleteGroup(props.index);
    event.stopPropagation();
  };

  const separateAddGroup = () => {
    props.btnGroupAdd(props.index);
  };

  const separateAddElement = () => {
    props.btnGroupAdd(props.index, 0);
  };

  const stopPropagation = (e) => e.stopPropagation();

  const handleInputKeyUp = (e) => {
    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
    }
  };

  const hoverDisplayAddGroup = () => {
    setHover(true);
    setDragGroup(true);
  };

  const hoverHideAddGroup = () => {
    setHover(false);
    setDragGroup(false);
  };

  const renderFormElements = () => {
    // Filter out voided or child elements to get visible form elements
    const visibleFormElements = props.groupData.formElements.filter(
      (formElement) =>
        !formElement.voided && _.isNil(formElement.parentFormElementUuid),
    );

    return visibleFormElements.map((formElement, visibleIndex) => {
      const propsElement = {
        key: formElement.uuid,
        formElementData: formElement,
        groupIndex: props.index,
        index: props.groupData.formElements.findIndex(
          (fe) => fe.uuid === formElement.uuid,
        ),
        btnGroupAdd: props.btnGroupAdd,
        identifierSources: props.identifierSources,
        groupSubjectTypes: props.groupSubjectTypes,
        handleGroupElementChange: props.handleGroupElementChange,
        deleteGroup: props.deleteGroup,
        updateConceptElementData: props.updateConceptElementData,
        handleGroupElementKeyValueChange:
          props.handleGroupElementKeyValueChange,
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
        onToggleInlineConceptCodedAnswerAttribute:
          props.onToggleInlineConceptCodedAnswerAttribute,
        onDeleteInlineConceptCodedAnswerDelete:
          props.onDeleteInlineConceptCodedAnswerDelete,
        onMoveUp: props.onMoveUp,
        onMoveDown: props.onMoveDown,
        onAlphabeticalSort: props.onAlphabeticalSort,
        handleInlineCodedAnswerAddition: props.handleInlineCodedAnswerAddition,
        handleInlineLocationAttributes: props.handleInlineLocationAttributes,
        handleInlineSubjectAttributes: props.handleInlineSubjectAttributes,
        handleInlinePhoneNumberAttributes:
          props.handleInlinePhoneNumberAttributes,
        entityName: props.entityName,
        disableFormElement: props.disableGroup,
        subjectType: props.subjectType,
        form: props.form,
        handleInlineEncounterAttributes: props.handleInlineEncounterAttributes,
      };

      return (
        <Draggable
          key={formElement.uuid} // Use UUID for stable key
          draggableId={`Group${props.groupData.uuid}Element${formElement.uuid}`} // Use UUIDs for stable draggableId
          index={visibleIndex} // Use visibleIndex for correct ordering
          isDragDisabled={props.disableGroup}
        >
          {(provided) => (
            <div {...provided.draggableProps} ref={provided.innerRef}>
              <FormElementWithAddButton
                {...propsElement}
                dragHandleProps={provided.dragHandleProps}
              />
            </div>
          )}
        </Draggable>
      );
    });
  };

  const [dragGroup, setDragGroup] = useState(false);
  const disableGroup = props.disableGroup;

  const DragHandler = ({ dragHandleProps }) => (
    <StyledDragHandler {...dragHandleProps}>
      <StyledDragHandleContainer show={dragGroup && !disableGroup}>
        <DragHandle color="disabled" />
      </StyledDragHandleContainer>
    </StyledDragHandler>
  );

  return (
    <Draggable
      key={props.groupData.uuid} // Use UUID for stable key
      draggableId={`Group${props.groupData.uuid}`} // Use UUID for stable draggableId
      index={props.index}
      isDragDisabled={disableGroup}
    >
      {(provided) => (
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
              onChange={() =>
                props.handleGroupElementChange(
                  props.index,
                  "expanded",
                  !props.groupData.expanded,
                )
              }
            >
              <StyledAccordionSummary
                aria-controls={`${panel}bh-content`}
                id={`${panel}bh-header`}
                {...provided.dragHandleProps}
              >
                <Grid
                  container
                  alignItems="center"
                  wrap="nowrap"
                  sx={{ width: "100%" }}
                >
                  <Grid
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: theme.spacing(0.5),
                      flexBasis: "20%",
                    }}
                  >
                    <Tooltip title={"Grouped Questions"}>
                      <StyledGroupIcon />
                    </Tooltip>
                    <StyledExpandIcon expanded={props.groupData.expanded} />
                  </Grid>

                  <Grid
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: theme.spacing(0.5),
                      flexBasis: "35%",
                    }}
                  >
                    <StyledTypography sx={{ flex: 1, minWidth: 120 }}>
                      {props.groupData.errorMessage &&
                        props.groupData.errorMessage.name && (
                          <StyledErrorText>
                            Please enter Page name.
                          </StyledErrorText>
                        )}
                      {get(props.groupData, "errorMessage.ruleError") && (
                        <StyledErrorText>
                          Please check the rule validation errors
                        </StyledErrorText>
                      )}
                      <FormControl fullWidth>
                        <Input
                          type="text"
                          placeholder="Page name"
                          name={`name${panel}`}
                          disableUnderline
                          onClick={stopPropagation}
                          onKeyUp={handleInputKeyUp}
                          value={props.groupData.name}
                          onChange={(event) =>
                            eventCall(props.index, "name", event.target.value)
                          }
                          autoComplete="off"
                          disabled={disableGroup}
                        />
                      </FormControl>
                    </StyledTypography>
                  </Grid>

                  <Grid
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexBasis: "15%",
                    }}
                  >
                    <DragHandler dragHandleProps={provided.dragHandleProps} />
                  </Grid>

                  <Grid
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: theme.spacing(0.5),
                      flexBasis: "15%",
                    }}
                  >
                    <StyledQuestionCount
                      component="div"
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      {questionCount} questions
                    </StyledQuestionCount>
                  </Grid>

                  <Grid
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: theme.spacing(0.5),
                      flexBasis: "15%",
                      justifyContent: "flex-end",
                    }}
                  >
                    <IconButton
                      aria-label="delete"
                      onClick={handleDelete}
                      disabled={disableGroup}
                      size="small"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                    <ToolTip
                      toolTipKey="APP_DESIGNER_FORM_ELEMENT_GROUP_NAME"
                      displayPosition="top"
                    />
                  </Grid>
                </Grid>
              </StyledAccordionSummary>
              <AccordionDetails style={{ padding: 0 }}>
                <Grid direction="column" style={{ width: "100%" }}>
                  <StyledTabs
                    value={tabIndex}
                    onChange={(event, value) => setTabIndex(value)}
                  >
                    <Tab
                      label="Details"
                      sx={{
                        color: "#fff",
                        "&.Mui-selected": {
                          color: "#fff",
                        },
                      }}
                    />
                    <Tab
                      label="Rules"
                      sx={{
                        color: "#fff",
                        "&.Mui-selected": {
                          color: "#fff",
                        },
                      }}
                    />
                  </StyledTabs>
                  <StyledDetailsContainer hidden={tabIndex !== 0}>
                    <Droppable
                      droppableId={`Group${props.groupData.uuid}`}
                      type="task"
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
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
                          disabled={disableGroup}
                        >
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
                              onChange={(event) =>
                                props.handleGroupElementChange(
                                  props.index,
                                  "timed",
                                  event.target.checked,
                                )
                              }
                            />
                          }
                          label="Timed Page"
                        />
                      </StyledFlexItem>
                      <StyledFlexItem>
                        <ColourStyle
                          label="Text colour"
                          colour={props.groupData.textColour}
                          onChange={(colour) =>
                            props.handleGroupElementChange(
                              props.index,
                              "textColour",
                              colour,
                            )
                          }
                          toolTipKey="APP_DESIGNER_GROUP_TEXT_COLOUR"
                        />
                      </StyledFlexItem>
                      <StyledFlexItem>
                        <ColourStyle
                          label="Background colour"
                          colour={props.groupData.backgroundColour}
                          onChange={(colour) =>
                            props.handleGroupElementChange(
                              props.index,
                              "backgroundColour",
                              colour,
                            )
                          }
                          toolTipKey="APP_DESIGNER_GROUP_BACKGROUND_COLOUR"
                        />
                      </StyledFlexItem>
                    </StyledFlexContainer>
                  </StyledDetailsContainer>
                  <Grid hidden={tabIndex !== 1}>
                    <FormElementGroupRule
                      groupData={props.groupData}
                      disable={disableGroup}
                      {...props}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </StyledAccordion>
          </Grid>
          {hover && (
            <StyledFab
              color="primary"
              aria-label="add"
              onClick={separateAddGroup}
              size="small"
              disabled={disableGroup}
            >
              <Add />
            </StyledFab>
          )}
        </StyledParent>
      )}
    </Draggable>
  );
}

export default memo(FormElementGroup, isEqual);
