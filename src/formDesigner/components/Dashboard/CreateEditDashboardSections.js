import React from "react";
import { Input, IconButton, Typography, Tooltip, MenuItem } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import { isEmpty, filter, map, size } from "lodash";
import Grid from "@material-ui/core/Grid";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ListIcon from "@material-ui/icons/List";
import { SelectCardsView } from "./SelectCardsView";
import CreateEditDashboardSectionCards from "./CreateEditDashboardSectionCards";
import { makeStyles } from "@material-ui/core/styles";
import { AvniTextField } from "../../../common/components/AvniTextField";
import { AvniFormLabel } from "../../../common/components/AvniFormLabel";
import { AvniSelect } from "../../../common/components/AvniSelect";
import { DragNDropComponent } from "../../common/DragNDropComponent";

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

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

const CreateEditDashboardSections = props => {
  const classes = useStyles();

  const stopPropagation = e => e.stopPropagation();

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

  const addCards = (cards, section) => {
    const updatedCards = updateDisplayOrder([...section.cards, ...cards]);
    props.dispatch({ type: "updateSectionField", payload: { section, cards: updatedCards } });
  };

  const renderSection = (section, index) => {
    const viewTypes =
      section.viewType === "Default" ? ["Default", "Tile", "List"] : ["Tile", "List"];
    return (
      <Grid container>
        <Grid item xs={12}>
          <AvniTextField
            multiline
            id={"description" + index}
            label="Section Description"
            autoComplete="off"
            value={section.description}
            onChange={event => changeSectionDescription(section, event.target.value)}
            toolTipKey={"APP_DESIGNER_DASHBOARD_SECTION_DESCRIPTION"}
          />
          <br />
          <AvniSelect
            style={{ width: "200px" }}
            onChange={event => changeSectionViewType(section, event.target.value)}
            options={viewTypes.map(viewType => (
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
            dashboardCards={filter(section.cards, card => card.voided === false)}
            dispatch={props.dispatch}
            addCards={cards => addCards(cards, section)}
          />
          <CreateEditDashboardSectionCards
            section={section}
            cards={filter(
              section.cards,
              card =>
                card.voided === false &&
                filter(
                  section.dashboardSectionCardMappings,
                  sectionCardMapping => sectionCardMapping.voided === false
                )
                  .map(sectionCardMapping => sectionCardMapping.reportCardUUID)
                  .includes(card.uuid)
            )}
            // cards={section.cards}
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

  const renderOtherSummary = (section, index, expanded) => (
    <Grid container item sm={12} alignItems={"center"}>
      <Grid item sm={2}>
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
          <Input
            type="text"
            placeholder="Section name"
            name={"name" + index}
            disableUnderline={true}
            onClick={stopPropagation}
            value={section.name}
            onChange={event => changeSectionName(section, event.target.value)}
            autoComplete="off"
          />
        </Typography>
      </Grid>
      <Grid item sm={3}>
        <Typography className={classes.questionCount}>
          {size(
            filter(
              section.dashboardSectionCardMappings,
              sectionCardMapping => sectionCardMapping.voided === false
            )
          )}{" "}
          cards
        </Typography>
      </Grid>
      <Grid item sm={2}>
        <IconButton aria-label="delete" onClick={() => handleDelete(section)}>
          <DeleteIcon />
        </IconButton>
      </Grid>
    </Grid>
  );

  return (
    <React.Fragment>
      {!isEmpty(sections) && (
        <DragNDropComponent
          dataList={props.sections}
          onDragEnd={onDragEnd}
          renderOtherSummary={(section, index, expanded) =>
            renderOtherSummary(section, index, expanded)
          }
          renderDetails={section => renderSection(section)}
          summaryDirection={"row"}
        />
      )}
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
