import { every, find, isEmpty, some } from "lodash";
import http from "../utils/httpClient";
import { CustomFilter, DashboardFilterConfig, GroupSubjectTypeFilter, ObservationBasedFilter } from "openchs-models";
import EntityService from "./EntityService";
import WebReportCard from "../model/WebReportCard";
import WebStandardReportCardType from "../model/WebStandardReportCardType";
import WebDashboard from "../model/reports/WebDashboard";
import WebDashboardSection from "../model/reports/WebDashboardSection";

const dashboardEndpoint = "/web/dashboard";

class DashboardService {
  static validate(dashboard) {
    const { name, sections } = dashboard;
    const errors = [];
    if (isEmpty(name)) {
      errors.push({ key: "EMPTY_NAME", message: "Name cannot be empty" });
    }
    if (isEmpty(sections)) {
      errors.push({ key: "EMPTY_SECTIONS", message: "Sections cannot be empty" });
    }
    if (find(sections, ({ name }) => isEmpty(name))) {
      errors.push({
        key: "EMPTY_SECTIONS",
        message: "Section name cannot be left blank. Please specify it for all sections."
      });
    }
    if (find(sections, ({ viewType }) => isEmpty(viewType))) {
      errors.push({
        key: "EMPTY_SECTIONS",
        message: "Section view type cannot be blank. Please select a view type"
      });
    }
    if (find(sections, section => isEmpty(WebDashboardSection.getReportCards(section)))) {
      errors.push({ key: "EMPTY_SECTIONS", message: "Please add cards to the section." });
    }
    const incompatibleCardsAndFilters = WebDashboard.getIncompatibleCardsAndFilters(dashboard);
    if (incompatibleCardsAndFilters.length !== 0) {
      const message = incompatibleCardsAndFilters.map(({ card, filter }) => `{Card: ${card.name}, Filter: ${filter.name}}`).join(". ");
      errors.push({
        key: "INCOMPATIBLE_FILTER_AND_CARD",
        message: `Standard report cards of types related to Approval, Comments, Tasks and Checklist currently doesn't support any filter other than Address. Incompatible "Card <=> Filter" combinations are as follows: ${message}`
      });
    }
    this.validateForMissingSubjectTypeFilter(dashboard.filters, errors);
    return errors;
  }

  static validateForMissingSubjectTypeFilter(dashboardFilters, errors) {
    if (
      some(dashboardFilters, x => x.filterConfig.subjectType) &&
      every(dashboardFilters, x => x.filterConfig.type !== CustomFilter.type.SubjectType)
    ) {
      errors.push({
        key: "MISSING_SUBJECT_TYPE_FILTER",
        message: "One or more filters configured are dependent on the SubjectType filter."
      });
    }
  }

  static save(dashboard, edit, id) {
    const url = edit ? `${dashboardEndpoint}/${id}` : "/web/dashboard";
    const methodName = edit ? "put" : "post";
    const payload = WebDashboard.toResource(dashboard);
    return http[methodName](url, payload).then(res => {
      if (res.status === 200) {
        return res.data;
      }
    });
  }

  static mapDashboardFromResource(dashboardResponse, operationalModules) {
    const dashboard = { ...dashboardResponse };
    dashboard.filters = dashboardResponse.filters.map(x => {
      const filter = { ...x };
      const filterConfig = new DashboardFilterConfig();

      const { subjectTypes, programs, encounterTypes } = operationalModules;
      const filterConfigInResponse = x.filterConfig;
      filterConfig.subjectType =
        filterConfigInResponse.subjectTypeUUID && EntityService.findByUuid(subjectTypes, filterConfigInResponse.subjectTypeUUID);
      filterConfig.widget = filterConfigInResponse.widget;
      filterConfig.type = filterConfigInResponse.type;
      if (filterConfigInResponse.type === CustomFilter.type.GroupSubject) {
        const groupSubjectTypeFilter = new GroupSubjectTypeFilter();
        groupSubjectTypeFilter.subjectType = EntityService.findByUuid(
          subjectTypes,
          filterConfigInResponse.groupSubjectTypeFilter.subjectTypeUUID
        );
        filterConfig.groupSubjectTypeFilter = groupSubjectTypeFilter;
      } else if (filterConfigInResponse.type === CustomFilter.type.Concept) {
        const observationBasedFilter = new ObservationBasedFilter();
        observationBasedFilter.scope = filterConfigInResponse.observationBasedFilter.scope;
        observationBasedFilter.concept = filterConfigInResponse.observationBasedFilter.concept;
        observationBasedFilter.programs = filterConfigInResponse.observationBasedFilter.programUUIDs.map(p =>
          EntityService.findByUuid(programs, p)
        );
        observationBasedFilter.encounterTypes = filterConfigInResponse.observationBasedFilter.encounterTypeUUIDs.map(e =>
          EntityService.findByUuid(encounterTypes, e)
        );
        filterConfig.observationBasedFilter = observationBasedFilter;
      }
      filter.filterConfig = filterConfig;
      return filter;
    });
    return dashboard;
  }

  static getDashboard(id, operationalModules) {
    return http
      .get(`${dashboardEndpoint}/${id}`)
      .then(res => res.data)
      .then(dashboardResponse => DashboardService.mapDashboardFromResource(dashboardResponse, operationalModules));
  }

  static getStandardReportCardTypes() {
    return http
      .get("/web/standardReportCardType")
      .then(res => res.data)
      .then(standardReportCardTypes => standardReportCardTypes.map(x => WebStandardReportCardType.fromResource(x)));
  }

  static getReportCard(id) {
    return http.get(`/web/reportCard/${id}`).then(res => WebReportCard.fromResource(res.data));
  }

  static saveReportCard(card) {
    const url = card.isNew() ? "/web/reportCard" : `/web/reportCard/${card.id}`;
    const methodName = card.isNew() ? "post" : "put";
    return http[methodName](url, card.toResource());
  }

  static getAllReportCards() {
    return http.get(`/web/reportCard`).then(res => res.data);
  }
}

export default DashboardService;
