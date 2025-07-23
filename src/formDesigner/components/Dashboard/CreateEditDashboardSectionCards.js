import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IconButton, ListItemText } from "@mui/material";
import { Delete, Visibility } from "@mui/icons-material";
import { isEmpty } from "lodash";
import DragNDropComponent from "../../common/DragNDropComponent";
import WebDashboardSection from "../../../common/model/reports/WebDashboardSection";
import { dashboardReducerActions } from "./DashboardReducer";
import UserInfo from "../../../common/model/UserInfo";
import { Privilege } from "openchs-models";

const CreateEditDashboardSectionCards = ({ section, dispatch, deleteCard }) => {
  const navigate = useNavigate();
  const userInfo = useSelector(state => state.app.userInfo);

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
          {UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditDashboard) && (
            <>
              <IconButton onClick={() => navigate(`/appDesigner/reportCard/${card.id}/show`)} size="large">
                <Visibility />
              </IconButton>
              <IconButton onClick={() => deleteCard(card)} size="large">
                <Delete />
              </IconButton>
            </>
          )}
        </>
      )
    };
  };

  const cards = WebDashboardSection.getReportCards(section) || [];
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
        summaryDirection="column"
      />
    )
  );
};

export default CreateEditDashboardSectionCards;
