import { Fragment } from "react";
import { styled } from "@mui/material/styles";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IconButton, Input, Tooltip, Typography, Grid } from "@mui/material";
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
import UserInfo from "../../../common/model/UserInfo";
import { Privilege } from "openchs-models";

const StyledTypography = styled(Typography)(({ theme, variant }) => ({
  ...(variant === "heading" && {
    fontSize: theme.typography.pxToRem(15)
  }),
  ...(variant === "questionCount" && {
    paddingTop: "5px"
  })
}));

const StyledIcon = styled("span")(({ variant }) => ({
  ...(variant === "list" && {
    marginRight: 4
  }),
  ...(variant !== "list" && {
    marginRight: 4
  })
}));

const StyledSelect = styled(AvniSelect)({
  width: "200px"
});

function EditSection({ section, index, dispatch }) {
  const navigate = useNavigate();
  const viewTypes =
    section.viewType === "Default"
      ? ["Default", "Tile", "List"]
      : ["Tile", "List"];
  console.log("EditSection: Rendering", {
    section: {
      uuid: section.uuid,
      name: section.name,
      cards: WebDashboardSection.getReportCards(section).length
    },
    index
  });

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
            dispatch({
              type: dashboardReducerActions.updateSectionField,
              payload: { section, description: event.target.value }
            })
          }
          toolTipKey={"APP_DESIGNER_DASHBOARD_SECTION_DESCRIPTION"}
        />
        <br />
        <StyledSelect
          onChange={event =>
            dispatch({
              type: dashboardReducerActions.updateSectionField,
              payload: { section, viewType: event.target.value }
            })
          }
          options={viewTypes.map(viewType => ({
            value: viewType,
            label: viewType
          }))}
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
          dashboardSection={section}
          addCards={cards =>
            dispatch({
              type: dashboardReducerActions.addCards,
              payload: { section, cards }
            })
          }
        />
        <CreateEditDashboardSectionCards
          section={section}
          dispatch={dispatch}
          deleteCard={card =>
            dispatch({
              type: dashboardReducerActions.deleteCard,
              payload: { card, section }
            })
          }
          navigate={navigate}
        />
      </Grid>
    </Grid>
  );
}

function DashboardSectionSummary({ section, index, expanded, dispatch }) {
  const stopPropagation = e => e.stopPropagation();

  return {
    text: (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          gap: "16px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <Tooltip title="Grouped Questions">
            <StyledIcon as={List} variant="list" />
          </Tooltip>
          <StyledIcon
            as={expanded === "panel" + index ? ExpandLess : ExpandMore}
          />
        </div>
        <div
          style={{
            flex: "1 1 0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
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
                dispatch({
                  type: dashboardReducerActions.updateSectionField,
                  payload: { section, name: event.target.value }
                })
              }
              autoComplete="off"
            />
          </StyledTypography>
        </div>
        <div
          style={{
            flex: "1 1 0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <StyledTypography variant="questionCount">
            {WebDashboardSection.getReportCards(section).length} cards
          </StyledTypography>
        </div>
      </div>
    ),
    actions: (
      <IconButton
        aria-label="delete"
        onClick={() =>
          dispatch({
            type: dashboardReducerActions.deleteSection,
            payload: section
          })
        }
        size="large"
      >
        <Delete />
      </IconButton>
    )
  };
}

const CreateEditDashboardSections = ({ sections, dispatch }) => {
  const userInfo = useSelector(state => state.app.userInfo);
  const navigate = useNavigate();

  if (!UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditDashboard)) {
    navigate("/");
    return null;
  }

  const onDragEnd = result => {
    if (!result.destination) {
      return;
    }
    dispatch({
      type: dashboardReducerActions.changeSectionDisplayOrder,
      payload: {
        sourceIndex: result.source.index,
        destIndex: result.destination.index
      }
    });
  };

  return (
    <Fragment>
      {!isEmpty(sections) && (
        <DragNDropComponent
          dataList={sections}
          onDragEnd={onDragEnd}
          renderSummaryText={(section, index, expanded) =>
            DashboardSectionSummary({ section, index, expanded, dispatch }).text
          }
          renderSummaryActions={(section, index, expanded) =>
            DashboardSectionSummary({ section, index, expanded, dispatch })
              .actions
          }
          renderDetails={(section, index, expanded) => {
            console.log("CreateEditDashboardSections: renderDetails", {
              section: {
                uuid: section.uuid,
                name: section.name,
                cards: WebDashboardSection.getReportCards(section).length
              },
              index,
              expanded
            });
            return (
              <EditSection
                dispatch={dispatch}
                section={section}
                index={index}
              />
            );
          }}
          summaryDirection={"row"}
        />
      )}
    </Fragment>
  );
};

export default CreateEditDashboardSections;
