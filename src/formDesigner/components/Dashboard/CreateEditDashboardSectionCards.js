import React, { Component } from "react";
import {
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { isEmpty } from "lodash";
import { DragNDropComponent } from "../../common/DragNDropComponent";

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

class CreateEditDashboardSectionCards extends Component {
  constructor(props) {
    super(props);
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  onDragEnd(result) {
    if (!result.destination) {
      return;
    }
    const cards = reorder(this.props.cards, result.source.index, result.destination.index);
    this.props.changeDisplayOrder(cards);
  }

  renderCard(card) {
    return (
      <List>
        <ListItem>
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
      </List>
    );
  }

  render() {
    const cards = this.props.cards;
    return (
      !isEmpty(cards) && (
        <DragNDropComponent
          dataList={this.props.cards}
          onDragEnd={this.onDragEnd}
          renderOtherSummary={card => this.renderCard(card)}
          summaryDirection={"column"}
        />
      )
    );
  }
}

export default CreateEditDashboardSectionCards;
