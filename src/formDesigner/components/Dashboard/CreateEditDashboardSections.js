import React, { Fragment } from "react";
import { styled } from "@mui/material/styles";
import { IconButton, Input, MenuItem, Tooltip, Typography, Grid } from "@mui/material";
import { Delete, ExpandMore, ExpandLess, List } from "@mui/icons-material";
import { isEmpty } from "lodash";
import { SelectCardsView } from "./SelectCardsView";
import CreateEditDashboardSectionCards from "./CreateEditDashboardSectionCards";
import { AvniTextField } from "../../../common/components/AvniTextField";
import { AvniFormLabel } from "../../../common/components/AvniFormLabel";
import { AvniSelect } from "../../../common/components/AvniSelect";
import DragNDropComponent from "../../common/DragNDropComponent";
import { dashboardReducerActions } from "./DashboardReducer";
import WebDashboardSection from "../../../common/model/reports/WebDashboardSection";

const StyledGrid = styled(Grid)(({ theme }) => ({
  alignItems: "center"
}));

const StyledTypography = styled(Typography)(({ theme, variant }) => ({
  ...(variant === "heading" && {
    fontSize: theme.typography.pxToRem(15)
  }),
  ...(variant === "questionCount" && {
    paddingTop: "5px"
  })
}));

const StyledIcon = styled("span")(({ theme, variant }) => ({
  ...(variant === "list" && {
    marginLeft: 12,
    marginRight: 4
  }),
  ...(variant !== "list" && {
    marginRight: "8px"
  })
}));

const StyledSelect = styled(AvniSelect)(({ theme }) => ({
  width: "200px"
}));

function EditSection({ section, index, dispatch, history }) {
  const viewTypes = section.viewType === "Default" ? ["Default", "Tile", "List"] : ["Tile", "List"];
  return (
    <Grid container>
      <Grid size={12}>
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
        <StyledSelect
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
  const stopPropagation = e => e.stopPropagation();

  return (
    <StyledGrid
      container
      size={{
        sm: 12
      }}
    >
      <Grid
        size={{
          sm: 2
        }}
      >
        <Tooltip title={"Grouped Questions"}>
          <StyledIcon as={List} variant="list" />
        </Tooltip>
        {expanded === "panel" + index ? <StyledIcon as={ExpandLess} /> : <StyledIcon as={ExpandMore} />}
      </Grid>
      <Grid
        size={{
          sm: 5
        }}
      >
        <StyledTypography variant="heading">
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
        </StyledTypography>
      </Grid>
      <Grid
        size={{
          sm: 3
        }}
      >
        <StyledTypography variant="questionCount">{WebDashboardSection.getReportCards(section).length} cards</StyledTypography>
      </Grid>
      <Grid
        size={{
          sm: 2
        }}
      >
        <IconButton
          aria-label="delete"
          onClick={() => dispatch({ type: dashboardReducerActions.deleteSection, payload: section })}
          size="large"
        >
          <Delete />
        </IconButton>
      </Grid>
    </StyledGrid>
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
    <Fragment>
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
    </Fragment>
  );
};

export default CreateEditDashboardSections;
