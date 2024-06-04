import _, { concat, reject, sortBy } from "lodash";
import { ModelGeneral as General } from "openchs-models";
import WebDashboardSection from "../../../common/model/reports/WebDashboardSection";
import WebDashboard from "../../../common/model/reports/WebDashboard";

const addSection = dashboard => {
  return WebDashboard.addNewSection(dashboard);
};

const updateSectionField = (dashboard, { section, ...fields }) => {
  const sections = reject(dashboard.sections, it => it.uuid === section.uuid);
  const updatedSection = { ...section, ...fields };
  sections.push(updatedSection);
  return { ...dashboard, sections: sortBy(sections, "displayOrder") };
};

const deleteCard = (dashboard, { card, section }) => {
  return WebDashboard.updateSection(dashboard, WebDashboardSection.removeCard(section, card));
};

const sectionUpdated = (dashboard, { section }) => {
  return WebDashboard.updateSection(dashboard, section);
};

const changeSectionDisplayOrder = (dashboard, { sourceIndex, destIndex }) => {
  return WebDashboard.reOrderSections(dashboard, sourceIndex, destIndex);
};

const deleteSection = (dashboard, section) => {
  return WebDashboard.removeSection(dashboard, section);
};

const setData = (thisIsNotNecessaryInThisCase, dashboard) => {
  return { ...dashboard };
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

const addCards = (dashboard, { section, cards }) => {
  return WebDashboard.updateSection(dashboard, WebDashboardSection.addCards(section, cards));
};

export const DashboardReducer = (dashboard, action) => {
  const actionFns = {
    name: (dashboard, name) => ({ ...dashboard, name }),
    description: (dashboard, description) => ({ ...dashboard, description }),
    addSection: addSection,
    updateSectionField: updateSectionField,
    addCards: addCards,
    deleteCard: deleteCard,
    sectionUpdated: sectionUpdated,
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
