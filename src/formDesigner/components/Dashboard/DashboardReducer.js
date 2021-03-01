import { map, reject, sortBy } from "lodash";

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
        cards: []
      };
      const newSections = updateDisplayOrder([...dashboard.sections, newSection]);
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
      return {
        ...dashboard,
        cards: reject(dashboard.cards, card => card.id === action.payload.id)
      };
    case "changeDisplayOrder":
      return { ...dashboard, cards: updateDisplayOrder(action.payload) };
    case "changeSectionDisplayOrder":
      return { ...dashboard, sections: updateDisplayOrder(action.payload) };
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
