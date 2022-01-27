import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import RootRef from "@material-ui/core/RootRef";
import { map, orderBy, isNil } from "lodash";
import Grid from "@material-ui/core/Grid";
import {
  ExpansionPanel as MuiExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary as MuiExpansionPanelSummary,
  withStyles
} from "@material-ui/core";
import React from "react";
import DragHandleIcon from "@material-ui/icons/DragHandle";

const getItemStyle = (isDragging, draggableStyle) => ({
  ...draggableStyle,
  ...{ cursor: "pointer", background: "#FFFFFF", margin: "8px 1px" }
});

const getListStyle = isDraggingOver => ({
  background: "#FFFFFF"
});

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

export const DragNDropComponent = ({
  onDragEnd,
  renderOtherSummary,
  renderDetails,
  dataList,
  summaryDirection
}) => {
  const [expanded, setExpanded] = React.useState(false);

  const handleChange = panel => (event, isExpanded) => {
    !isNil(renderDetails) && setExpanded(isExpanded ? panel : false);
  };

  const renderDragIcon = sectionUUID => {
    return (
      <div style={{ height: 5, align: "center" }}>
        <div hidden={expanded !== false}>
          <DragHandleIcon color={"disabled"} />
        </div>
      </div>
    );
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="drop_card">
        {(provided, snapshot) => (
          <RootRef rootRef={provided.innerRef}>
            <div style={getListStyle(snapshot.isDraggingOver)}>
              {map(orderBy(dataList, "displayOrder"), (data, index) => (
                <Draggable
                  isDragDisabled={expanded !== false}
                  key={data.uuid}
                  draggableId={data.uuid}
                  index={index}
                >
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
                      >
                        <ExpansionPanelSummary
                          aria-controls={"panel" + index + "bh-content"}
                          id={"panel" + index + "bh-header"}
                          {...provided.dragHandleProps}
                        >
                          <Grid container direction={summaryDirection}>
                            <Grid container item alignItems={"center"} justify={"center"}>
                              {renderDragIcon(data.uuid)}
                            </Grid>
                            {renderOtherSummary(data, index, expanded)}
                          </Grid>
                        </ExpansionPanelSummary>
                        {renderDetails && (
                          <ExpansionPanelDetails>
                            {renderDetails(data, index, expanded)}
                          </ExpansionPanelDetails>
                        )}
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
  );
};
