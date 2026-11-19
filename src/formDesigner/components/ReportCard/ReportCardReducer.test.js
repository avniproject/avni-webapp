import WebReportCard from "../../../common/model/WebReportCard";
import { ReportCardReducer, ReportCardReducerKeys } from "./ReportCardReducer";

const DASHBOARD = "dash-02";

// The reducer changes the card it is given and returns a clone, so each test builds its own card.
const openDashboardCard = () => {
  const card = WebReportCard.createNewReportCard();
  card.action = "OpenDashboard";
  card.actionDetailDashboardUUID = DASHBOARD;
  return card;
};

const reduce = (card, type, payload) => ReportCardReducer(card, { type, payload });

describe("ReportCardReducer", () => {
  it("stores the picked dashboard", () => {
    const card = WebReportCard.createNewReportCard();
    card.action = "OpenDashboard";

    const result = reduce(card, ReportCardReducerKeys.actionDetailDashboardUUID, DASHBOARD);

    expect(result.actionDetailDashboardUUID).toBe(DASHBOARD);
  });

  it.each(["ViewSubjectProfile", "DoVisit", "MarkAttendance", null])("drops the dashboard when the action changes to %p", (actionType) => {
    const result = reduce(openDashboardCard(), ReportCardReducerKeys.action, actionType);

    expect(result.actionDetailDashboardUUID).toBeNull();
  });

  it("keeps the dashboard when the action is set to Open dashboard again", () => {
    const result = reduce(openDashboardCard(), ReportCardReducerKeys.action, "OpenDashboard");

    expect(result.actionDetailDashboardUUID).toBe(DASHBOARD);
  });

  it("clears the Do visit details when the action changes to Open dashboard", () => {
    const card = WebReportCard.createNewReportCard();
    card.action = "DoVisit";
    card.actionDetailSubjectTypeUUID = "subject-type-01";
    card.actionDetailProgramUUID = "program-01";
    card.actionDetailEncounterTypeUUID = "encounter-type-01";
    card.actionDetailVisitType = "Scheduled";
    card.onActionCompletion = "goToSubjectProfile";

    const result = reduce(card, ReportCardReducerKeys.action, "OpenDashboard");

    expect(result.actionDetailSubjectTypeUUID).toBeNull();
    expect(result.actionDetailProgramUUID).toBeNull();
    expect(result.actionDetailEncounterTypeUUID).toBeNull();
    expect(result.actionDetailVisitType).toBeNull();
    expect(result.onActionCompletion).toBeNull();
  });

  it("keeps the dashboard when a loaded card is set", () => {
    const result = reduce(WebReportCard.createNewReportCard(), ReportCardReducerKeys.setData, openDashboardCard());

    expect(result.actionDetailDashboardUUID).toBe(DASHBOARD);
  });

  it("keeps the dashboard when the name changes", () => {
    const result = reduce(openDashboardCard(), ReportCardReducerKeys.name, "Renamed");

    expect(result.actionDetailDashboardUUID).toBe(DASHBOARD);
  });
});

describe("ReportCardReducer approval status", () => {
  const approveRejectCard = (status) => {
    const card = WebReportCard.createNewReportCard();
    card.action = "ApproveReject";
    card.actionDetailApprovalStatus = status;
    return card;
  };

  it("starts at Pending when the action changes to Approve or reject", () => {
    const result = reduce(WebReportCard.createNewReportCard(), ReportCardReducerKeys.action, "ApproveReject");

    expect(result.action).toBe("ApproveReject");
    expect(result.actionDetailApprovalStatus).toBe("Pending");
  });

  it("keeps a picked status when the action is set to Approve or reject again", () => {
    const result = reduce(approveRejectCard("Rejected"), ReportCardReducerKeys.action, "ApproveReject");

    expect(result.actionDetailApprovalStatus).toBe("Rejected");
  });

  it("stores the picked status", () => {
    const result = reduce(approveRejectCard("Pending"), ReportCardReducerKeys.actionDetailApprovalStatus, "Approved");

    expect(result.actionDetailApprovalStatus).toBe("Approved");
  });

  it.each(["ViewSubjectProfile", "DoVisit", "MarkAttendance", "OpenDashboard", null])(
    "drops the status when the action changes to %p",
    (actionType) => {
      const result = reduce(approveRejectCard("Approved"), ReportCardReducerKeys.action, actionType);

      expect(result.actionDetailApprovalStatus).toBeNull();
    },
  );

  it("drops the dashboard and the Do visit details when the action changes to Approve or reject", () => {
    const card = openDashboardCard();
    card.actionDetailSubjectTypeUUID = "st-1";

    const result = reduce(card, ReportCardReducerKeys.action, "ApproveReject");

    expect(result.actionDetailDashboardUUID).toBeNull();
    expect(result.actionDetailSubjectTypeUUID).toBeNull();
    expect(result.onActionCompletion).toBeNull();
  });

  it("keeps the status when a loaded card is set", () => {
    const result = reduce(WebReportCard.createNewReportCard(), ReportCardReducerKeys.setData, approveRejectCard("Rejected"));

    expect(result.actionDetailApprovalStatus).toBe("Rejected");
  });
});
