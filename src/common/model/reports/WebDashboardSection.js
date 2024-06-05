import { ModelGeneral as General } from "openchs-models";
import _ from "lodash";
import WebDashboardSectionCardMapping from "./WebDashboardSectionCardMapping";
import CollectionUtil from "../../utils/CollectionUtil";

class WebDashboardSection {
  dashboardSectionCardMappings;

  static getReportCardMappings(section) {
    return _.sortBy(section.dashboardSectionCardMappings.filter(x => !x.voided), "displayOrder");
  }

  static getReportCards(section) {
    return WebDashboardSection.getReportCardMappings(section).map(x => x.card);
  }

  static getReportCardMapping(section, cardId) {
    return _.find(section.dashboardSectionCardMappings, x => x.card.id === cardId);
  }

  static newSection() {
    return {
      name: "",
      description: "",
      viewType: "",
      displayOrder: 100,
      dashboardSectionCardMappings: [],
      uuid: General.randomUUID(),
      voided: false
    };
  }

  static removeCard(section, card) {
    const mapping = _.find(section.dashboardSectionCardMappings, x => x.card.uuid === card.uuid);
    mapping.voided = true;
    mapping.displayOrder = -1;
    section.dashboardSectionCardMappings = [...section.dashboardSectionCardMappings];
    return { ...section };
  }

  static reorderCards(section, startIndex, endIndex) {
    const reportCardMappings = WebDashboardSection.getReportCardMappings(section);
    CollectionUtil.switchItemPosition(reportCardMappings, startIndex, endIndex, "displayOrder");
    return { ...section };
  }

  static addCards(section, cards) {
    //get max display order
    let nextDisplayOrder =
      _.reduce(
        section.dashboardSectionCardMappings,
        (max, dashboardSectionCardMapping) => {
          return dashboardSectionCardMapping.displayOrder > max ? dashboardSectionCardMapping.displayOrder : max;
        },
        0
      ) + 1;

    cards.forEach(card => {
      section.dashboardSectionCardMappings.push(WebDashboardSectionCardMapping.newCard(card, nextDisplayOrder));
      nextDisplayOrder++;
    });

    section.dashboardSectionCardMappings = [...section.dashboardSectionCardMappings];
    return { ...section };
  }

  static getCardsNotAdded(section, allCards) {
    const cardsAdded = WebDashboardSection.getReportCards(section);
    return _.differenceBy(allCards, cardsAdded, "uuid");
  }

  static toResources(sections) {
    return sections.map(section => {
      return {
        name: section.name,
        description: section.description,
        viewType: section.viewType,
        displayOrder: section.displayOrder,
        uuid: section.uuid,
        voided: section.voided,
        dashboardSectionCardMappings: WebDashboardSectionCardMapping.toResources(section.dashboardSectionCardMappings)
      };
    });
  }
}

export default WebDashboardSection;
