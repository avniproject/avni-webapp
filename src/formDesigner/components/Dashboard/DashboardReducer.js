import _, { concat, every, reject, some } from "lodash";
import { CustomFilter, DashboardFilterConfig, ModelGeneral as General } from "openchs-models";
import WebDashboardSection from "../../../common/model/reports/WebDashboardSection";
import WebDashboard from "../../../common/model/reports/WebDashboard";

const addSection = dashboard => {
  return WebDashboard.addNewSection(dashboard);
};

const updateSectionField = (dashboard, { section, ...fields }) => {
  const updatedSection = { ...section, ...fields };
  return WebDashboard.updateSection(dashboard, updatedSection);
};

const deleteCard = (dashboard, { card, section }) => {
  return WebDashboard.updateSection(dashboard, WebDashboardSection.removeCard(section, card));
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
  return { ...dashboard, filters: addSubjectTypeFilterIfNeeded(newFilters) };
};

const editFilter = (dashboard, { modifiedFilter, selectedFilter }) => {
  const filters = reject(dashboard.filters, x => x.uuid === selectedFilter.uuid);
  if (!_.isNil(selectedFilter)) {
    modifiedFilter.id = selectedFilter.id;
    modifiedFilter.uuid = selectedFilter.uuid;
  }
  filters.push(modifiedFilter);
  return { ...dashboard, filters: addSubjectTypeFilterIfNeeded(filters) };
};

const addSubjectTypeFilterIfNeeded = dashboardFilters => {
  if (
    some(dashboardFilters, x => x.filterConfig.subjectType) &&
    every(dashboardFilters, x => x.filterConfig.type !== CustomFilter.type.SubjectType)
  ) {
    const dashboardFilter = {
      uuid: General.randomUUID(),
      name: "Subject Type",
      filterConfig: new DashboardFilterConfig()
    };
    dashboardFilter.filterConfig.type = CustomFilter.type.SubjectType;
    dashboardFilters.push(dashboardFilter);
  }
  return dashboardFilters;
};

const deleteFilter = (dashboard, { selectedFilter }) => {
  const filters = reject(dashboard.filters, x => x.uuid === selectedFilter.uuid);
  return { ...dashboard, filters };
};

const addCards = (dashboard, { section, cards }) => {
  return WebDashboard.updateSection(dashboard, WebDashboardSection.addCards(section, cards));
};

const reorderCards = (dashboard, { section, startIndex, endIndex }) => {
  return WebDashboard.updateSection(dashboard, WebDashboardSection.reorderCards(section, startIndex, endIndex));
};

export const dashboardReducerActions = {
  name: "name",
  description: "description",
  addSection: "addSection",
  updateSectionField: "updateSectionField",
  addCards: "addCards",
  deleteCard: "deleteCard",
  changeSectionDisplayOrder: "changeSectionDisplayOrder",
  deleteSection: "deleteSection",
  setData: "setData",
  addFilter: "addFilter",
  editFilter: "editFilter",
  deleteFilter: "deleteFilter",
  reorderCards: "reorderCards"
};

export const DashboardReducer = (dashboard, action) => {
  const actionFns = {
    name: (dashboard, name) => ({ ...dashboard, name }),
    description: (dashboard, description) => ({ ...dashboard, description }),
    addSection: addSection,
    updateSectionField: updateSectionField,
    addCards: addCards,
    deleteCard: deleteCard,
    changeSectionDisplayOrder: changeSectionDisplayOrder,
    deleteSection: deleteSection,
    setData: setData,
    addFilter: addFilter,
    editFilter: editFilter,
    deleteFilter: deleteFilter,
    reorderCards: reorderCards
  };
  const actionFn = actionFns[action.type] || (() => dashboard);
  return actionFn(dashboard, action.payload);
};
