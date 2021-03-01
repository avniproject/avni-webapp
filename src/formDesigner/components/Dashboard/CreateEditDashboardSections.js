import React from "react";
import {
  Input,
  IconButton,
  Button,
  ExpansionPanel as MuiExpansionPanel,
  ExpansionPanelSummary as MuiExpansionPanelSummary,
  Typography,
  Tooltip,
  ExpansionPanelDetails,
  MenuItem
} from "@material-ui/core";
import RootRef from "@material-ui/core/RootRef";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import DeleteIcon from "@material-ui/icons/Delete";
import { isEmpty, map, orderBy, size } from "lodash";
import Grid from "@material-ui/core/Grid";
import DragHandleIcon from "@material-ui/icons/DragHandle";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ListIcon from "@material-ui/icons/List";
import { SelectCardsView } from "./SelectCardsView";
import CreateEditDashboardSectionCards from "./CreateEditDashboardSectionCards";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { AvniTextField } from "../../../common/components/AvniTextField";
import { AvniFormLabel } from "../../../common/components/AvniFormLabel";
import { AvniSelect } from "../../../common/components/AvniSelect";

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const getItemStyle = (isDragging, draggableStyle) => ({
  ...draggableStyle,
  ...{ cursor: "pointer", background: "#FFFFFF" }
});

const getListStyle = isDraggingOver => ({
  background: "#FFFFFF"
});

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
    marginLeft: 20,
    marginTop: -20
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
  },
  sectionDesc: {
    margin: "2px"
  }
}));
export const ExpansionPanel = withStyles({
  root: {
    "&$expanded": {
      margin: 0
    }
  },
  expanded: {}
})(MuiExpansionPanel);
export const ExpansionPanelSummary = withStyles({
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

const CreateEditDashboardSections = props => {
  const classes = useStyles();
  const [currentSectionUUID, setCurrentSectionUUID] = React.useState(undefined);
  const [expanded, setExpanded] = React.useState(false);

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const stopPropagation = e => e.stopPropagation();

  const addSection = event => {
    props.addSection();
    event.stopPropagation();
  };

  const changeSectionName = (section, name) => {
    props.dispatch({ type: "updateSectionField", payload: { section, name } });
  };

  const changeSectionDescription = (section, description) => {
    props.dispatch({ type: "updateSectionField", payload: { section, description } });
  };

  const changeSectionViewType = (section, viewType) => {
    props.dispatch({ type: "updateSectionField", payload: { section, viewType } });
  };

  const handleDelete = section => {
    props.dispatch({ type: "deleteSection", payload: section });
  };

  const onDragEnd = result => {
    if (!result.destination) {
      return;
    }
    const sections = reorder(props.sections, result.source.index, result.destination.index);
    props.dispatch({ type: "changeSectionDisplayOrder", payload: sections });
  };

  const renderDragIcon = sectionUUID => {
    return (
      <div style={{ height: 5, align: "center" }}>
        <div hidden={currentSectionUUID !== sectionUUID}>
          <DragHandleIcon color={"disabled"} />
        </div>
      </div>
    );
  };

  const addCards = (cards, section) => {
    const updatedCards = updateDisplayOrder([...section.cards, ...cards]);
    props.dispatch({ type: "updateSectionField", payload: { section, cards: updatedCards } });
  };

  const renderSection = (section, index) => {
    return (
      <Grid container>
        <Grid item xs={12}>
          <AvniTextField
            multiline
            id={"description" + index}
            label="Description*"
            autoComplete="off"
            value={section.description}
            onChange={event => changeSectionDescription(section, event.target.value)}
            toolTipKey={"APP_DESIGNER_DASHBOARD_SECTION_DESCRIPTION"}
          />
          <br />
          <AvniSelect
            style={{ width: "200px" }}
            onChange={event => changeSectionViewType(section, event.target.value)}
            options={["Default", "Tile", "List"].map(viewType => (
              <MenuItem value={viewType} key={viewType}>
                {viewType}
              </MenuItem>
            ))}
            value={section.viewType}
            label="Section View Type"
            toolTipKey="APP_DESIGNER_DASHBOARD_SECTION_VIEW_TYPE"
          />
          <br />
          <AvniFormLabel
            label={"Add cards"}
            toolTipKey={"APP_DESIGNER_DASHBOARD_SECTION_ADD_CARDS"}
          />
          <SelectCardsView
            dashboardCards={section.cards}
            dispatch={props.dispatch}
            addCards={cards => addCards(cards, section)}
          />
          <CreateEditDashboardSectionCards
            section={section}
            cards={section.cards}
            dispatch={props.dispatch}
            changeDisplayOrder={cards =>
              props.dispatch({ type: "changeDisplayOrder", payload: { cards, section } })
            }
            deleteCard={card => props.dispatch({ type: "deleteCard", payload: { card, section } })}
            history={props.history}
          />
        </Grid>
      </Grid>
    );
  };
  const sections = props.sections;

  return (
    <React.Fragment>
      {!isEmpty(sections) && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="drop_card">
            {(provided, snapshot) => (
              <RootRef rootRef={provided.innerRef}>
                <div style={getListStyle(snapshot.isDraggingOver)}>
                  {map(orderBy(props.sections, "displayOrder"), (section, index) => (
                    <Draggable key={section.uuid} draggableId={section.uuid} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                        >
                          <ExpansionPanel
                            key={index}
                            expanded={expanded === "panel" + index}
                            onChange={handleChange("panel" + index)}
                            onMouseEnter={() => setCurrentSectionUUID(section.uuid)}
                            onMouseLeave={() => setCurrentSectionUUID(undefined)}
                          >
                            <ExpansionPanelSummary
                              aria-controls={"panel" + index + "bh-content"}
                              id={"panel" + index + "bh-header"}
                              {...provided.dragHandleProps}
                            >
                              <Grid container direction={"row"}>
                                <Grid container item alignItems={"center"} justify={"center"}>
                                  {renderDragIcon(section.uuid)}
                                </Grid>
                                <Grid container item sm={12} alignItems={"center"}>
                                  <Grid item sm={1}>
                                    <Tooltip title={"Grouped Questions"}>
                                      <ListIcon style={{ marginLeft: 12, marginRight: 4 }} />
                                    </Tooltip>
                                    {expanded === "panel" + index ? (
                                      <ExpandLessIcon classes={{ root: classes.icon }} />
                                    ) : (
                                      <ExpandMoreIcon classes={{ root: classes.icon }} />
                                    )}
                                  </Grid>
                                  <Grid item sm={5}>
                                    <Typography className={classes.heading}>
                                      {section.error && (
                                        <span style={{ color: "red" }}>
                                          Please enter section name.
                                        </span>
                                      )}

                                      <Input
                                        type="text"
                                        placeholder="Section name"
                                        name={"name" + index}
                                        disableUnderline={true}
                                        onClick={stopPropagation}
                                        value={section.name}
                                        onChange={event =>
                                          changeSectionName(section, event.target.value)
                                        }
                                        autoComplete="off"
                                      />
                                    </Typography>
                                  </Grid>
                                  <Grid item sm={3}>
                                    <Typography className={classes.questionCount}>
                                      {size(section.cards)} cards
                                    </Typography>
                                  </Grid>
                                  <Grid item sm={2}>
                                    <IconButton
                                      aria-label="delete"
                                      onClick={() => handleDelete(section)}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Grid>
                                </Grid>
                              </Grid>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>{renderSection(section)}</ExpansionPanelDetails>
                          </ExpansionPanel>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </RootRef>
            )}
          </Droppable>
        </DragDropContext>
      )}
      <Button color="primary" onClick={addSection}>
        Add Section
      </Button>
    </React.Fragment>
  );
};

export default CreateEditDashboardSections;

const updateDisplayOrder = items => {
  return map(items, (item, index) => {
    item.displayOrder = index + 1;
    return item;
  });
};
