import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { styled } from "@mui/material/styles";
import { map, orderBy, isNil } from "lodash";
import { Grid, Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
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
    margin: "0",
    "&.Mui-expanded": {
      margin: "0"
    }
  },
  "& .MuiAccordionSummary-expandIconWrapper": {
    marginHorizontal: "8px",
    display: "inline"
  }
});

const StyledGrid = styled(Grid)({
  alignItems: "center",
  justifyContent: "center"
});

const StyledDragIconContainer = styled("div")({
  height: 5,
  align: "center"
});

const DragNDropComponent = ({ onDragEnd, renderOtherSummary, renderDetails, dataList, summaryDirection }) => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = panel => (event, isExpanded) => {
    !isNil(renderDetails) && setExpanded(isExpanded ? panel : false);
  };

  const renderDragIcon = sectionUUID => {
    return (
      <StyledDragIconContainer>
        <div hidden={expanded !== false}>
          <DragHandle color="disabled" />
        </div>
      </StyledDragIconContainer>
    );
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="drop_card">
        {(provided, snapshot) => (
          <StyledDroppableContainer ref={provided.innerRef} isDraggingOver={snapshot.isDraggingOver} {...provided.droppableProps}>
            {map(orderBy(dataList, "displayOrder"), (data, index) => (
              <Draggable isDragDisabled={expanded !== false} key={data.uuid} draggableId={data.uuid} index={index}>
                {(provided, snapshot) => (
                  <StyledDraggableContainer
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    isDragging={snapshot.isDragging}
                  >
                    <StyledAccordion key={index} expanded={expanded === "panel" + index} onChange={handleChange("panel" + index)}>
                      <StyledAccordionSummary
                        aria-controls={"panel" + index + "bh-content"}
                        id={"panel" + index + "bh-header"}
                        {...provided.dragHandleProps}
                      >
                        <Grid container direction={summaryDirection}>
                          <StyledGrid container>{renderDragIcon(data.uuid)}</StyledGrid>
                          {renderOtherSummary(data, index, expanded)}
                        </Grid>
                      </StyledAccordionSummary>
                      {renderDetails && <AccordionDetails>{renderDetails(data, index, expanded)}</AccordionDetails>}
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
