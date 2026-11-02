import WebReportCard from "./WebReportCard";

const DASHBOARD = "dash-02";

const resource = (overrides) => ({
  id: 5,
  name: "Monthly overview",
  description: null,
  color: "#1b6ec2",
  query: "({params}) => []",
  nested: false,
  count: 1,
  standardReportCardInputSubjectTypes: [],
  standardReportCardInputPrograms: [],
  standardReportCardInputEncounterTypes: [],
  standardReportCardInputRecentDuration: null,
  ...overrides,
});

// The target is set on the card directly, so clone, toResource and validateCard are tested apart from fromResource,
// and an empty string stays an empty string (fromResource would turn it into null).
const openDashboardCard = (dashboardUUID) => {
  const card = WebReportCard.fromResource(resource({ action: "OpenDashboard" }));
  card.actionDetailDashboardUUID = dashboardUUID;
  return card;
};

describe("WebReportCard", () => {
  describe("target dashboard", () => {
    it("starts a new card with no target dashboard", () => {
      expect(WebReportCard.createNewReportCard().actionDetailDashboardUUID).toBeNull();
    });

    it("reads the target dashboard the server sends", () => {
      const card = WebReportCard.fromResource(resource({ action: "OpenDashboard", actionDetailDashboardUUID: DASHBOARD }));

      expect(card.actionDetailDashboardUUID).toBe(DASHBOARD);
    });

    it("reads no target dashboard when the server sends none", () => {
      const card = WebReportCard.fromResource(resource({ action: "ViewSubjectProfile" }));

      expect(card.actionDetailDashboardUUID).toBeNull();
    });

    it("keeps the target dashboard on clone", () => {
      const card = openDashboardCard(DASHBOARD);

      expect(WebReportCard.clone(card).actionDetailDashboardUUID).toBe(DASHBOARD);
    });

    it("sends the target dashboard to the server", () => {
      const card = openDashboardCard(DASHBOARD);

      expect(card.toResource().actionDetailDashboardUUID).toBe(DASHBOARD);
    });
  });

  describe("validateCard", () => {
    it.each([
      [null, "customData"],
      ["", "customData"],
      [null, "fullyCustom"],
    ])("asks for a dashboard when Open dashboard has none (%p, %s)", (dashboardUUID, cardType) => {
      const card = openDashboardCard(dashboardUUID);

      expect(card.validateCard(cardType)).toContainEqual({
        key: "MISSING_DASHBOARD",
        message: "Dashboard is required for Open dashboard action",
      });
    });

    it("accepts Open dashboard with a dashboard picked", () => {
      const card = openDashboardCard(DASHBOARD);

      expect(card.validateCard("customData").map((error) => error.key)).not.toContain("MISSING_DASHBOARD");
    });

    it("does not ask for a dashboard for another action", () => {
      const card = WebReportCard.fromResource(resource({ action: "ViewSubjectProfile" }));

      expect(card.validateCard("customData").map((error) => error.key)).not.toContain("MISSING_DASHBOARD");
    });
  });
});
