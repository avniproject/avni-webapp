import React from "react";
import { makeStyles } from "@mui/styles";
import { IconButton, Input, MenuItem, Tooltip, Typography, GridLegacy as Grid } from "@mui/material";
import { Delete, ExpandMore, ExpandLess, List } from "@mui/icons-material";
import { isEmpty } from "lodash";
import { SelectCardsView } from "./SelectCardsView";
import CreateEditDashboardSectionCards from "./CreateEditDashboardSectionCards";
import { AvniTextField } from "../../../common/components/AvniTextField";
import { AvniFormLabel } from "../../../common/components/AvniFormLabel";
import { AvniSelect } from "../../../common/components/AvniSelect";
import { DragNDropComponent } from "../../common/DragNDropComponent";
import { dashboardReducerActions } from "./DashboardReducer";
import WebDashboardSection from "../../../common/model/reports/WebDashboardSection";

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

function EditSection({ section, index, dispatch, history }) {
  const viewTypes = section.viewType === "Default" ? ["Default", "Tile", "List"] : ["Tile", "List"];
  return (
    <Grid container>
      <Grid item xs={12}>
        <AvniTextField
          multiline
          id={"description" + index}
          label="Section Description"
          autoComplete="off"
          value={section.description}
          onChange={event =>
            dispatch({ type: dashboardReducerActions.updateSectionField, payload: { section, description: event.target.value } })
          }
          toolTipKey={"APP_DESIGNER_DASHBOARD_SECTION_DESCRIPTION"}
        />
        <br />
        <AvniSelect
          style={{ width: "200px" }}
          onChange={event =>
            dispatch({ type: dashboardReducerActions.updateSectionField, payload: { section, viewType: event.target.value } })
          }
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
        <AvniFormLabel label={"Add cards"} toolTipKey={"APP_DESIGNER_DASHBOARD_SECTION_ADD_CARDS"} />
        <SelectCardsView
          dashboardSection={section}
          addCards={cards => dispatch({ type: dashboardReducerActions.addCards, payload: { section, cards } })}
        />
        <CreateEditDashboardSectionCards
          section={section}
          dispatch={dispatch}
          deleteCard={card => dispatch({ type: dashboardReducerActions.deleteCard, payload: { card, section } })}
          history={history}
        />
      </Grid>
    </Grid>
  );
}

function DashboardSectionSummary({ section, index, expanded, dispatch }) {
  const classes = useStyles();
  const stopPropagation = e => e.stopPropagation();

  return (
    <Grid
      container
      item
      sm={12}
      sx={{
        alignItems: "center"
      }}
    >
      <Grid item sm={2}>
        <Tooltip title={"Grouped Questions"}>
          <List style={{ marginLeft: 12, marginRight: 4 }} />
        </Tooltip>
        {expanded === "panel" + index ? <ExpandLess classes={{ root: classes.icon }} /> : <ExpandMore classes={{ root: classes.icon }} />}
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
            onChange={event =>
              dispatch({ type: dashboardReducerActions.updateSectionField, payload: { section, name: event.target.value } })
            }
            autoComplete="off"
          />
        </Typography>
      </Grid>
      <Grid item sm={3}>
        <Typography className={classes.questionCount}>{WebDashboardSection.getReportCards(section).length} cards</Typography>
      </Grid>
      <Grid item sm={2}>
        <IconButton
          aria-label="delete"
          onClick={() => dispatch({ type: dashboardReducerActions.deleteSection, payload: section })}
          size="large"
        >
          <Delete />
        </IconButton>
      </Grid>
    </Grid>
  );
}
const CreateEditDashboardSections = props => {
  const onDragEnd = result => {
    if (!result.destination) {
      return;
    }
    props.dispatch({
      type: dashboardReducerActions.changeSectionDisplayOrder,
      payload: { sourceIndex: result.source.index, destIndex: result.destination.index }
    });
  };

  const sections = props.sections;

  return (
    <React.Fragment>
      {!isEmpty(sections) && (
        <DragNDropComponent
          dataList={props.sections}
          onDragEnd={onDragEnd}
          renderOtherSummary={(section, index, expanded) => (
            <DashboardSectionSummary index={index} section={section} expanded={expanded} dispatch={props.dispatch} />
          )}
          renderDetails={(section, index) => (
            <EditSection dispatch={props.dispatch} section={section} history={props.history} index={index} />
          )}
          summaryDirection={"row"}
        />
      )}
    </React.Fragment>
  );
};

export default CreateEditDashboardSections;
