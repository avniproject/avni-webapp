import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { map, orderBy, isNil } from "lodash";
import { withStyles } from "@mui/styles";
import { Grid, Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import React from "react";
import { DragHandle } from "@mui/icons-material";

const getItemStyle = (isDragging, draggableStyle) => ({
  ...draggableStyle,
  ...{ cursor: "pointer", background: "#FFFFFF", margin: "8px 1px" }
});

const getListStyle = isDraggingOver => ({
  background: "#FFFFFF"
});

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

export const DragNDropComponent = ({ onDragEnd, renderOtherSummary, renderDetails, dataList, summaryDirection }) => {
  const [expanded, setExpanded] = React.useState(false);

  const handleChange = panel => (event, isExpanded) => {
    !isNil(renderDetails) && setExpanded(isExpanded ? panel : false);
  };

  const renderDragIcon = sectionUUID => {
    return (
      <div style={{ height: 5, align: "center" }}>
        <div hidden={expanded !== false}>
          <DragHandle color="disabled" />
        </div>
      </div>
    );
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="drop_card">
        {(provided, snapshot) => (
          <div ref={provided.innerRef} style={getListStyle(snapshot.isDraggingOver)} {...provided.droppableProps}>
            {map(orderBy(dataList, "displayOrder"), (data, index) => (
              <Draggable isDragDisabled={expanded !== false} key={data.uuid} draggableId={data.uuid} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                  >
                    <StyledAccordion key={index} expanded={expanded === "panel" + index} onChange={handleChange("panel" + index)}>
                      <StyledAccordionSummary
                        aria-controls={"panel" + index + "bh-content"}
                        id={"panel" + index + "bh-header"}
                        {...provided.dragHandleProps}
                      >
                        <Grid container direction={summaryDirection}>
                          <Grid container item alignItems="center" justifyContent="center">
                            {renderDragIcon(data.uuid)}
                          </Grid>
                          {renderOtherSummary(data, index, expanded)}
                        </Grid>
                      </StyledAccordionSummary>
                      {renderDetails && <AccordionDetails>{renderDetails(data, index, expanded)}</AccordionDetails>}
                    </StyledAccordion>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
