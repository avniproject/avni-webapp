import { forEach, map, reject, sortBy, concat } from "lodash";
import { ModelGeneral as General } from "openchs-models";

const addSection = dashboard => {
  const newSection = {
    name: "",
    description: "",
    viewType: "",
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

const setData = (dashboard, data) => {
  forEach(data.sections, section => {
    section.cards = sortBy(section.cards, "displayOrder");
  });
  return {
    ...dashboard,
    name: data.name,
    description: data.description,
    sections: sortBy(data.sections, "displayOrder"),
    filters: data.filters || []
  };
};

const updateDisplayOrder = items => {
  return map(items, (item, index) => {
    item.displayOrder = index + 1;
    return item;
  });
};

const addFilter = (dashboard, { newFilter }) => {
  const filterToAdd = {
    name: newFilter.titleKey,
    filter: newFilter,
    uuid: General.randomUUID()
  };
  const newFilters = concat(dashboard.filters, filterToAdd);
  return { ...dashboard, filters: newFilters };
};

const editFilter = (dashboard, { selectedFilter, newFilter }) => {
  const filters = reject(dashboard.filters, it => it["filter"] === selectedFilter);
  const filterToAdd = {
    name: newFilter.titleKey,
    filter: newFilter,
    uuid: General.randomUUID()
  };
  filters.push(filterToAdd);
  return { ...dashboard, filters };
};

const deleteFilter = (dashboard, { selectedFilter }) => {
  const filters = reject(dashboard.filters, it => it["filter"] === selectedFilter);
  return { ...dashboard, filters };
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
    setData: setData,
    addFilter: addFilter,
    editFilter: editFilter,
    deleteFilter: deleteFilter
  };
  const actionFn = actionFns[action.type] || (() => dashboard);
  return actionFn(dashboard, action.payload);
};
