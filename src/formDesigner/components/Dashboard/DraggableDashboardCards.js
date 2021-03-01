import React, { Component } from "react";
import {
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText
} from "@material-ui/core";
import RootRef from "@material-ui/core/RootRef";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import DeleteIcon from "@material-ui/icons/Delete";
import Box from "@material-ui/core/Box";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { isEmpty, map, orderBy } from "lodash";
import Grid from "@material-ui/core/Grid";
import DragHandleIcon from "@material-ui/icons/DragHandle";

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

class DraggableDashboardCards extends Component {
  constructor(props) {
    super(props);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.state = { currentCardId: undefined };
  }

  onDragEnd(result) {
    if (!result.destination) {
      return;
    }
    const cards = reorder(this.props.cards, result.source.index, result.destination.index);
    this.props.changeDisplayOrder(cards);
  }

  renderDragIcon(cardId) {
    return (
      <div style={{ height: 5, align: "center" }}>
        <div hidden={this.state.currentCardId !== cardId}>
          <DragHandleIcon color={"disabled"} />
        </div>
      </div>
    );
  }

  renderCard(card) {
    return (
      <ListItem
        onMouseEnter={() => this.setState({ currentCardId: card.id })}
        onMouseLeave={() => this.setState({ currentCardId: undefined })}
      >
        <ListItemText primary={card.name} secondary={card.description} />
        <ListItemSecondaryAction>
          <IconButton
            onClick={() => this.props.history.push(`/appDesigner/reportCard/${card.id}/show`)}
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton onClick={() => this.props.deleteCard(card)}>
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );
  }

  render() {
    const cards = this.props.cards;
    return (
      !isEmpty(cards) && (
        <DragDropContext onDragEnd={this.onDragEnd}>
          <Droppable droppableId="drop_card">
            {(provided, snapshot) => (
              <RootRef rootRef={provided.innerRef}>
                <List style={getListStyle(snapshot.isDraggingOver)}>
                  {map(orderBy(this.props.cards, "displayOrder"), (card, index) => (
                    <Draggable key={card.id} draggableId={card.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                        >
                          <Box border={2} my={0.5} borderColor={"rgba(133,133,133,0.49)"}>
                            <Grid container direction={"column"}>
                              <Grid item align="center">
                                {this.renderDragIcon(card.id)}
                              </Grid>
                              <Grid item>{this.renderCard(card)}</Grid>
                            </Grid>
                          </Box>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </List>
              </RootRef>
            )}
          </Droppable>
        </DragDropContext>
      )
    );
  }
}

export default DraggableDashboardCards;
