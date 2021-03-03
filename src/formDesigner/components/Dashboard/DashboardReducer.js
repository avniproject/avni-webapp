import { map, reject, sortBy } from "lodash";
import { ModelGeneral as General } from "openchs-models";

export const DashboardReducer = (dashboard, action) => {
  var sections, section, name;
  switch (action.type) {
    case "name":
      return { ...dashboard, name: action.payload };
    case "description":
      return { ...dashboard, description: action.payload };
    case "addSection":
      const newSection = {
        name: "",
        description: "",
        viewType: "Default",
        displayOrder: 100,
        cards: [],
        uuid: General.randomUUID()
      };
      const newSections = updateDisplayOrder([
        ...sortBy(dashboard.sections, "displayOrder"),
        newSection
      ]);
      return { ...dashboard, sections: newSections };
    case "updateSectionName":
      var { name, section } = action.payload;
      sections = reject(dashboard.sections, it => it === section);
      sections.push({ ...section, name });
      return { ...dashboard, sections: updateDisplayOrder(sections) };
    case "updateSectionCards":
      var { cards, section } = action.payload;
      sections = reject(dashboard.sections, it => it === section);
      sections.push({ ...section, cards });
      return { ...dashboard, sections: sortBy(sections, "displayOrder") };
    case "deleteCard":
      var { card, section } = action.payload;
      var updatedSections = map(dashboard.sections, ds => {
        if (section === ds) {
          const updatedCards = reject(ds.cards, it => it === card);
          ds.cards = updatedCards;
          return ds;
        } else return ds;
      });
      return {
        ...dashboard,
        cards: reject(dashboard.cards, card => card.id === action.payload.id)
      };
    case "changeDisplayOrder":
      var { cards, section } = action.payload;
      const cardsInOrder = updateDisplayOrder(cards);
      var updatedSections = map(dashboard.sections, ds => {
        if (section === ds) {
          ds.cards = cardsInOrder;
          return ds;
        } else return ds;
      });
      return { ...dashboard, sections: updatedSections };
    case "changeSectionDisplayOrder":
      return { ...dashboard, sections: updateDisplayOrder(action.payload) };
    case "deleteSection":
      return { ...dashboard, sections: reject(dashboard.sections, it => it === action.payload) };
    case "setData":
      return {
        ...dashboard,
        name: action.payload.name,
        description: action.payload.description,
        sections: action.payload.sections
      };
    default:
      return dashboard;
  }
};

const updateDisplayOrder = items => {
  return map(items, (item, index) => {
    item.displayOrder = index + 1;
    return item;
  });
};
