import React, { Component } from "react";
import { IconButton, List, ListItem, ListItemSecondaryAction, ListItemText } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { isEmpty } from "lodash";
import { DragNDropComponent } from "../../common/DragNDropComponent";
import PropTypes from "prop-types";
import WebDashboardSection from "../../../common/model/reports/WebDashboardSection";

class CreateEditDashboardSectionCards extends Component {
  constructor(props) {
    super(props);
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  static propTypes = {
    section: PropTypes.object.isRequired,
    sectionUpdated: PropTypes.func.isRequired
  };

  onDragEnd(result) {
    if (!result.destination) {
      return;
    }
    const section = WebDashboardSection.reorderCards(this.props.section, result.source.index, result.destination.index);
    this.props.sectionUpdated(section);
  }

  renderCard(card) {
    return (
      <List>
        <ListItem>
          <ListItemText primary={card.name} secondary={card.description} />
          <ListItemSecondaryAction>
            <IconButton onClick={() => this.props.history.push(`/appDesigner/reportCard/${card.id}/show`)}>
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
    const cards = WebDashboardSection.getReportCards(this.props.section);
    return (
      !isEmpty(cards) && (
        <DragNDropComponent
          dataList={cards}
          onDragEnd={this.onDragEnd}
          renderOtherSummary={card => this.renderCard(card)}
          summaryDirection={"column"}
        />
      )
    );
  }
}

export default CreateEditDashboardSectionCards;
