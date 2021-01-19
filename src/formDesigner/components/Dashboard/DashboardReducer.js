import { map, reject } from "lodash";

export const DashboardReducer = (dashboard, action) => {
  switch (action.type) {
    case "name":
      return { ...dashboard, name: action.payload };
    case "description":
      return { ...dashboard, description: action.payload };
    case "addCards":
      const updatedCards = [...dashboard.cards, ...action.payload];
      return { ...dashboard, cards: updateDisplayOrder(updatedCards) };
    case "deleteCard":
      return {
        ...dashboard,
        cards: reject(dashboard.cards, card => card.id === action.payload.id)
      };
    case "changeDisplayOrder":
      return { ...dashboard, cards: updateDisplayOrder(action.payload) };
    case "setData":
      return {
        ...dashboard,
        name: action.payload.name,
        description: action.payload.description,
        cards: action.payload.cards
      };
    default:
      return dashboard;
  }
};

const updateDisplayOrder = cards => {
  return map(cards, (card, index) => {
    card.displayOrder = index + 1;
    return card;
  });
};
