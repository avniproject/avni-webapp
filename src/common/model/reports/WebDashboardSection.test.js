import WebDashboardSection from "./WebDashboardSection";
import WebDashboardSectionCardMapping from "./WebDashboardSectionCardMapping";
import WebReportCardFactory from "./WebReportCardFactory";
import { assert } from "chai";

it("should reorder cards down to up", function() {
  const section = {
    dashboardSectionCardMappings: [
      WebDashboardSectionCardMapping.newCard(WebReportCardFactory.create({ id: 2 }), 1),
      WebDashboardSectionCardMapping.newCard(WebReportCardFactory.create({ id: 3 }), 2),
      WebDashboardSectionCardMapping.newCard(WebReportCardFactory.create({ id: 1 }), 3),
      WebDashboardSectionCardMapping.newCard(WebReportCardFactory.create({ id: 4 }), 4)
    ]
  };

  const reOrderedSection = WebDashboardSection.reorderCards(section, 2, 1);
  assert.equal(WebDashboardSection.getReportCardMapping(reOrderedSection, 2).displayOrder, 1);
  assert.equal(WebDashboardSection.getReportCardMapping(reOrderedSection, 1).displayOrder, 2);
  assert.equal(WebDashboardSection.getReportCardMapping(reOrderedSection, 3).displayOrder, 3);
  assert.equal(WebDashboardSection.getReportCardMapping(reOrderedSection, 4).displayOrder, 4);
});

it("should reorder cards up to down", function() {
  const section = {
    dashboardSectionCardMappings: [
      WebDashboardSectionCardMapping.newCard(WebReportCardFactory.create({ id: 2 }), 1),
      WebDashboardSectionCardMapping.newCard(WebReportCardFactory.create({ id: 3 }), 2),
      WebDashboardSectionCardMapping.newCard(WebReportCardFactory.create({ id: 1 }), 3),
      WebDashboardSectionCardMapping.newCard(WebReportCardFactory.create({ id: 4 }), 4)
    ]
  };

  const reOrderedSection = WebDashboardSection.reorderCards(section, 1, 2);
  assert.equal(WebDashboardSection.getReportCardMapping(reOrderedSection, 2).displayOrder, 1);
  assert.equal(WebDashboardSection.getReportCardMapping(reOrderedSection, 1).displayOrder, 2);
  assert.equal(WebDashboardSection.getReportCardMapping(reOrderedSection, 3).displayOrder, 3);
  assert.equal(WebDashboardSection.getReportCardMapping(reOrderedSection, 4).displayOrder, 4);
});
