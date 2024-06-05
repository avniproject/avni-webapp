class WebDashboardSectionCardMapping {
  static newCard(card, displayOrder) {
    return {
      card: card,
      displayOrder: displayOrder,
      voided: false
    };
  }

  static toResources(dashboardSectionCardMappings) {
    return dashboardSectionCardMappings.map(dashboardSectionCardMapping => {
      return {
        reportCardUUID: dashboardSectionCardMapping.card.uuid,
        displayOrder: dashboardSectionCardMapping.displayOrder,
        uuid: dashboardSectionCardMapping.uuid,
        voided: dashboardSectionCardMapping.voided
      };
    });
  }
}

export default WebDashboardSectionCardMapping;
