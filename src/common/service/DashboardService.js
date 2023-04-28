import { find, isEmpty, sortBy } from "lodash";
import http from "../utils/httpClient";
import {
  DashboardFilterConfig,
  GroupSubjectTypeFilter,
  ObservationBasedFilter,
  CustomFilter
} from "openchs-models";
import EntityService from "./EntityService";
import _ from "lodash";

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
    if (!!find(sections, ({ name }) => isEmpty(name))) {
      errors.push({
        key: "EMPTY_SECTIONS",
        message: "Section name cannot be left blank. Please specify it for all sections."
      });
    }
    if (!!find(sections, ({ viewType }) => isEmpty(viewType))) {
      errors.push({
        key: "EMPTY_SECTIONS",
        message: "Section view type cannot be blank. Please select a view type"
      });
    }
    if (!!find(sections, ({ cards }) => isEmpty(cards))) {
      errors.push({ key: "EMPTY_SECTIONS", message: "Please add cards to the section." });
    }
    return errors;
  }

  static save(dashboard, edit, id) {
    const url = edit ? `${dashboardEndpoint}/${id}` : "/web/dashboard";
    const methodName = edit ? "put" : "post";
    const payload = { ...dashboard };
    payload.filters = dashboard.filters.map(x => {
      return {
        name: x.name,
        voided: x.voided,
        uuid: x.uuid,
        filterConfig: x.filterConfig.toServerRequest()
      };
    });
    return http[methodName](url, payload).then(res => {
      if (res.status === 200) {
        return res.data;
      }
    });
  }

  static mapDashboardFromResource(dashboardResponse, operationalModules) {
    const dashboard = { ...dashboardResponse };
    _.forEach(dashboard.sections, section => {
      section.cards = sortBy(section.cards, "displayOrder");
    });

    dashboard.filters = dashboardResponse.filters.map(x => {
      const filter = { ...x };
      const filterConfig = new DashboardFilterConfig();

      const { subjectTypes, programs, encounterTypes } = operationalModules;
      const filterConfigInResponse = x.filterConfig;
      filterConfig.subjectType = EntityService.findByUuid(
        subjectTypes,
        filterConfigInResponse.subjectTypeUUID
      );
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
        observationBasedFilter.programs = filterConfigInResponse.observationBasedFilter.programUUIDs.map(
          p => EntityService.findByUuid(programs, p)
        );
        observationBasedFilter.encounterTypes = filterConfigInResponse.observationBasedFilter.encounterTypeUUIDs.map(
          e => EntityService.findByUuid(encounterTypes, e)
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
      .then(dashboardResponse =>
        DashboardService.mapDashboardFromResource(dashboardResponse, operationalModules)
      );
  }
}

export default DashboardService;
