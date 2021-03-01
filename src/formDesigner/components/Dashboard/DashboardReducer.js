import { map, reject, sortBy } from "lodash";
import { ModelGeneral as General } from "openchs-models";

const addSection = dashboard => {
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
};

const updateSectionField = (dashboard, { section, ...fields }) => {
  const sections = reject(dashboard.sections, it => it === section);
  sections.push({ ...section, ...fields });
  return { ...dashboard, sections: sortBy(sections, "displayOrder") };
};

const deleteCard = (dashboard, { card, section }) => {
  const sections = map(dashboard.sections, ds => {
    if (section === ds) {
      ds.cards = reject(ds.cards, it => it === card);
    }
    return ds;
  });
  return { ...dashboard, sections };
};

const changeDisplayOrder = (dashboard, { cards, section }) => {
  const cardsInOrder = updateDisplayOrder(cards);
  const updatedSections = map(dashboard.sections, ds => {
    if (section === ds) {
      ds.cards = cardsInOrder;
      return ds;
    } else return ds;
  });
  return { ...dashboard, sections: updatedSections };
};

const changeSectionDisplayOrder = (dashboard, sections) => ({
  ...dashboard,
  sections: updateDisplayOrder(sections)
});

const deleteSection = (dashboard, section) => ({
  ...dashboard,
  sections: reject(dashboard.sections, it => it === section)
});

const updateDisplayOrder = items => {
  return map(items, (item, index) => {
    item.displayOrder = index + 1;
    return item;
  });
};

export const DashboardReducer = (dashboard, action) => {
  const actionFns = {
    name: (dashboard, name) => ({ ...dashboard, name }),
    description: (dashboard, description) => ({ ...dashboard, description }),
    addSection: addSection,
    updateSectionField: updateSectionField,
    deleteCard: deleteCard,
    changeDisplayOrder: changeDisplayOrder,
    changeSectionDisplayOrder: changeSectionDisplayOrder,
    deleteSection: deleteSection,
    setData: (dashboard, data) => ({
      ...dashboard,
      name: data.name,
      description: data.description,
      sections: data.sections
    })
  };
  const actionFn = actionFns[action.type] || (() => dashboard);
  return actionFn(dashboard, action.payload);
};
