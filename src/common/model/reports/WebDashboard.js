import _ from "lodash";
import WebDashboardSection from "./WebDashboardSection";

class WebDashboard {
  static createNew() {
    return { name: "", description: "", sections: [], filters: [] };
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
    const result = [...dashboard.sections];
    const [removed] = result.splice(sourceIndex, 1);
    result.splice(destIndex, 0, removed);
    dashboard.sections = result;
    return { ...dashboard };
  }

  static addNewSection(dashboard) {
    dashboard.sections.push(WebDashboardSection.newSection());
    dashboard.sections = _.sortBy(dashboard.sections, "displayOrder");
    return { ...dashboard };
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
