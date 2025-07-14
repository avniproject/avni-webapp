import { IconButton, ListItemText } from "@mui/material";
import { Delete, Visibility } from "@mui/icons-material";
import { isEmpty } from "lodash";
import DragNDropComponent from "../../common/DragNDropComponent";
import PropTypes from "prop-types";
import WebDashboardSection from "../../../common/model/reports/WebDashboardSection";
import { dashboardReducerActions } from "./DashboardReducer";

const CreateEditDashboardSectionCards = ({ section, dispatch, history, deleteCard }) => {
  const onDragEnd = result => {
    if (!result.destination) {
      return;
    }
    dispatch({
      type: dashboardReducerActions.reorderCards,
      payload: { section, startIndex: result.source.index, endIndex: result.destination.index }
    });
  };

  const renderCard = card => {
    return {
      text: <ListItemText primary={card.name} secondary={card.description} />,
      actions: (
        <>
          <IconButton onClick={() => history.push(`/appDesigner/reportCard/${card.id}/show`)} size="large">
            <Visibility />
          </IconButton>
          <IconButton onClick={() => deleteCard(card)} size="large">
            <Delete />
          </IconButton>
        </>
      )
    };
  };

  const cards = WebDashboardSection.getReportCards(section);
  console.log("CreateEditDashboardSectionCards: Rendering", {
    section: { uuid: section.uuid, name: section.name },
    cardCount: cards.length,
    cards: cards.map(card => ({ id: card.id, name: card.name }))
  });

  return (
    !isEmpty(cards) && (
      <DragNDropComponent
        dataList={cards}
        onDragEnd={onDragEnd}
        renderSummaryText={card => renderCard(card).text}
        renderSummaryActions={card => renderCard(card).actions}
        summaryDirection={"column"}
      />
    )
  );
};

CreateEditDashboardSectionCards.propTypes = {
  section: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  deleteCard: PropTypes.func.isRequired
};

export default CreateEditDashboardSectionCards;
