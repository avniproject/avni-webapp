import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { styled } from "@mui/material/styles";
import { map, orderBy, isNil } from "lodash";
import {
  Grid,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography
} from "@mui/material";
import { useState } from "react";
import { DragHandle } from "@mui/icons-material";

const StyledDroppableContainer = styled("div")(({ isDraggingOver }) => ({
  background: "#FFFFFF"
}));

const StyledDraggableContainer = styled("div")(({ isDragging }) => ({
  cursor: "pointer",
  background: "#FFFFFF",
  margin: "8px 1px"
}));

const StyledAccordion = styled(Accordion)({
  "&.Mui-expanded": {
    margin: 0
  }
});

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  position: "relative",
  backgroundColor: "#dbdbdb",
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  minHeight: 56,
  "&.Mui-expanded": {
    minHeight: 56
  },
  "&.Mui-focused": {
    backgroundColor: "#dbdbdb"
  },
  "& .MuiAccordionSummary-content": {
    margin: theme.spacing(1),
    "&.Mui-expanded": {
      margin: theme.spacing(1)
    }
  },
  "& .MuiAccordionSummary-expandIconWrapper": {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    display: "inline"
  }
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  display: "block",
  overflow: "visible",
  minHeight: "100px"
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
  justifyContent: "center"
}));

const StyledDragHandleContainer = styled("div", {
  shouldForwardProp: prop => prop !== "show"
})(({ show }) => ({
  display: show ? "block" : "none"
}));

const StyledGrid = styled(Grid)({
  alignItems: "center",
  width: "100%",
  display: "flex"
});

const DragNDropComponent = ({
  onDragEnd,
  renderSummaryText,
  renderSummaryActions,
  renderDetails,
  dataList,
  summaryDirection,
  renderOtherSummary
}) => {
  const [expanded, setExpanded] = useState(null);

  const handleChange = panel => (event, isExpanded) => {
    console.log("DragNDropComponent: handleChange", {
      panel,
      isExpanded,
      expanded,
      newExpanded: isExpanded ? panel : null
    });
    !isNil(renderDetails) && setExpanded(isExpanded ? panel : null);
  };

  const renderDragIcon = sectionUUID => {
    return (
      <StyledDragHandler>
        <StyledDragHandleContainer show={expanded === null}>
          <DragHandle color="disabled" />
        </StyledDragHandleContainer>
      </StyledDragHandler>
    );
  };

  // Enhanced logging for debugging
  const safeRenderSummaryText = (data, index, expanded) => {
    if (typeof renderSummaryText === "function") {
      return renderSummaryText(data, index, expanded);
    }
    console.warn("DragNDropComponent: renderSummaryText is not a function", {
      renderSummaryText: renderSummaryText,
      type: typeof renderSummaryText,
      dataList: dataList
        ? dataList.map(item => ({ uuid: item.uuid, name: item.name }))
        : null,
      summaryDirection,
      location: "Check the component calling DragNDropComponent"
    });
    if (typeof renderOtherSummary === "function") {
      console.warn(
        "DragNDropComponent: renderOtherSummary is deprecated, please use renderSummaryText and renderSummaryActions"
      );
      return renderOtherSummary(data, index, expanded);
    }
    return <Typography>No text provided</Typography>;
  };

  const safeRenderSummaryActions = (data, index, expanded) => {
    if (typeof renderSummaryActions === "function") {
      return renderSummaryActions(data, index, expanded);
    }
    console.warn("DragNDropComponent: renderSummaryActions is not a function", {
      renderSummaryActions: renderSummaryActions,
      type: typeof renderSummaryActions,
      dataList: dataList
        ? dataList.map(item => ({ uuid: item.uuid, name: item.name }))
        : null,
      summaryDirection,
      location: "Check the component calling DragNDropComponent"
    });
    return null;
  };

  const safeRenderDetails = (data, index, expanded) => {
    if (typeof renderDetails === "function") {
      console.log("DragNDropComponent: Rendering details", {
        data: { uuid: data.uuid, name: data.name },
        index,
        expanded
      });
      return renderDetails(data, index, expanded);
    }
    console.warn("DragNDropComponent: renderDetails is not a function", {
      renderDetails: renderDetails,
      type: typeof renderDetails,
      dataList: dataList
        ? dataList.map(item => ({ uuid: item.uuid, name: item.name }))
        : null,
      summaryDirection,
      location: "Check the component calling DragNDropComponent"
    });
    return null;
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="drop_card">
        {(provided, snapshot) => (
          <StyledDroppableContainer
            ref={provided.innerRef}
            isDraggingOver={snapshot.isDraggingOver}
            {...provided.droppableProps}
          >
            {map(orderBy(dataList, "displayOrder"), (data, index) => (
              <Draggable
                isDragDisabled={expanded !== null}
                key={data.uuid}
                draggableId={data.uuid}
                index={index}
              >
                {(provided, snapshot) => (
                  <StyledDraggableContainer
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    isDragging={snapshot.isDragging}
                  >
                    <StyledAccordion
                      key={index}
                      expanded={expanded === "panel" + index}
                      onChange={handleChange("panel" + index)}
                    >
                      <StyledAccordionSummary
                        aria-controls={"panel" + index + "bh-content"}
                        id={"panel" + index + "bh-header"}
                        {...provided.dragHandleProps}
                      >
                        <StyledGrid container alignItems="center" wrap="nowrap">
                          {/* Text (icons, name, count) - Left-aligned with internal flexbox */}
                          <Grid
                            item
                            sx={{
                              flex: "1 1 auto",
                              display: "flex",
                              alignItems: "center",
                              ml: 0,
                              mr: 2,
                              gap: 2
                            }}
                          >
                            {safeRenderSummaryText(data, index, expanded)}
                          </Grid>
                          {/* Drag icon (midpoint) */}
                          <Grid
                            sx={{
                              flex: "0 0 auto",
                              display: "flex",
                              justifyContent: "center",
                              width: 24
                            }}
                          >
                            {renderDragIcon(data.uuid)}
                          </Grid>
                          {/* Actions (rightmost edge) */}
                          <Grid
                            item
                            sx={{
                              flex: "0 0 auto",
                              display: "flex",
                              justifyContent: "flex-end",
                              alignItems: "center",
                              ml: "auto",
                              gap: 1
                            }}
                          >
                            {safeRenderSummaryActions(data, index, expanded)}
                          </Grid>
                        </StyledGrid>
                      </StyledAccordionSummary>
                      {renderDetails && (
                        <StyledAccordionDetails>
                          {safeRenderDetails(data, index, expanded)}
                        </StyledAccordionDetails>
                      )}
                    </StyledAccordion>
                  </StyledDraggableContainer>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </StyledDroppableContainer>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DragNDropComponent;
