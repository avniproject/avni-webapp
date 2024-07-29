import _ from "lodash";
import WebDashboardSection from "./WebDashboardSection";
import CollectionUtil from "../../utils/CollectionUtil";
import WebReportCard from "../WebReportCard";

class WebDashboard {
  sections;

  static createNew() {
    return { name: "", description: "", sections: [], filters: [] };
  }

  static getSections(dashboard) {
    return _.sortBy(dashboard.sections.filter(x => !x.voided), "displayOrder");
  }

  static removeSection(dashboard, section) {
    const dashboardSection = _.find(dashboard.sections, x => x.uuid === section.uuid);
    dashboardSection.voided = true;
    dashboard.sections = [...dashboard.sections];
    return { ...dashboard };
  }

  static updateSection(dashboard, section) {
    const index = _.findIndex(dashboard.sections, x => x.uuid === section.uuid);
    dashboard.sections[index] = section;
    return { ...dashboard };
  }

  static reOrderSections(dashboard, sourceIndex, destIndex) {
    CollectionUtil.switchItemPosition(dashboard.sections, sourceIndex, destIndex, "displayOrder");
    return { ...dashboard };
  }

  static addNewSection(dashboard) {
    dashboard.sections.push(WebDashboardSection.newSection());
    dashboard.sections = _.sortBy(dashboard.sections, "displayOrder");
    return { ...dashboard };
  }

  static getIncompatibleCardsAndFilters(dashboard) {
    const incompatibles = [];
    dashboard.sections.forEach(section => {
      WebDashboardSection.getReportCards(section).forEach(card => {
        dashboard.filters.forEach(filter => {
          if (!WebReportCard.supportsFilter(card, filter)) {
            incompatibles.push({ card, filter });
          }
        });
      });
    });
    return incompatibles;
  }

  static toResource(dashboard) {
    const resource = {
      uuid: dashboard.uuid,
      id: dashboard.id,
      name: dashboard.name,
      description: dashboard.description
    };
    resource.sections = WebDashboardSection.toResources(dashboard.sections);
    resource.filters = dashboard.filters.map(x => {
      return {
        name: x.name,
        voided: x.voided,
        uuid: x.uuid,
        filterConfig: x.filterConfig.toServerRequest()
      };
    });
    return resource;
  }
}

export default WebDashboard;
