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

describe("WebReportCard approval status", () => {
  it("starts a new card with no approval status", () => {
    expect(WebReportCard.createNewReportCard().actionDetailApprovalStatus).toBeNull();
  });

  it("reads the approval status the server sends, keeps it on clone and sends it back", () => {
    const card = WebReportCard.fromResource(resource({ action: "ApproveReject", actionDetailApprovalStatus: "Rejected" }));

    expect(card.actionDetailApprovalStatus).toBe("Rejected");
    expect(card.isActionApproveReject()).toBe(true);
    expect(WebReportCard.clone(card).actionDetailApprovalStatus).toBe("Rejected");
    expect(card.toResource().actionDetailApprovalStatus).toBe("Rejected");
    expect(card.toResource().action).toBe("ApproveReject");
  });

  it("reads no approval status when the server sends none", () => {
    expect(WebReportCard.fromResource(resource({ action: "ViewSubjectProfile" })).actionDetailApprovalStatus).toBeNull();
  });

  it("asks for an approval status on an Approve or reject card", () => {
    const card = WebReportCard.fromResource(resource({ action: "ApproveReject" }));

    expect(card.validateCard("customData").map((e) => e.key)).toEqual(["MISSING_APPROVAL_STATUS"]);
  });

  it.each(["Pending", "Approved", "Rejected"])("accepts Approve or reject with %s", (status) => {
    const card = WebReportCard.fromResource(resource({ action: "ApproveReject", actionDetailApprovalStatus: status }));

    expect(card.validateCard("customData")).toEqual([]);
    expect(card.validateCard("nested")).toEqual([]);
  });

  it("does not ask for an approval status for another action", () => {
    const card = WebReportCard.fromResource(resource({ action: "ViewSubjectProfile" }));

    expect(card.validateCard("customData")).toEqual([]);
  });

  it("offers the three approval states with the phone's status strings", () => {
    expect(WebReportCard.approvalStatusOptions.map((o) => o.value)).toEqual(["Pending", "Approved", "Rejected"]);
  });
});
