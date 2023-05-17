import { map, reject, sortBy, concat } from "lodash";
import _ from "lodash";
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

const setData = (thisIsNotNecessaryInThisCase, dashboard) => {
  return { ...dashboard };
};

const updateDisplayOrder = items => {
  return map(items, (item, index) => {
    item.displayOrder = index + 1;
    return item;
  });
};

const addFilter = (dashboard, { modifiedFilter }) => {
  modifiedFilter.uuid = General.randomUUID();
  const newFilters = concat(dashboard.filters, modifiedFilter);
  return { ...dashboard, filters: newFilters };
};

const editFilter = (dashboard, { modifiedFilter, selectedFilter }) => {
  const filters = reject(dashboard.filters, x => x.uuid === selectedFilter.uuid);
  if (!_.isNil(selectedFilter)) {
    modifiedFilter.id = selectedFilter.id;
    modifiedFilter.uuid = selectedFilter.uuid;
  }
  filters.push(modifiedFilter);
  return { ...dashboard, filters };
};

const deleteFilter = (dashboard, { selectedFilter }) => {
  const filters = reject(dashboard.filters, x => x.uuid === selectedFilter.uuid);
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
