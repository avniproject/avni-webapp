const FIELD_LABELS = {
  sessionOutcomeReasonConcept: "Session Outcome Reason",
  absenceReasonConcept: "Absence Reason",
  followUpEncounterType: "Follow-up Encounter Type",
};

export const isAttendanceConfigIncompleteError = (error) => error?.response?.data?.error === "AttendanceConfigIncomplete";

export const buildAttendanceConfigIncompleteMessage = (error) => {
  const incompleteTypes = error?.response?.data?.incompleteTypes || [];
  if (incompleteTypes.length === 0) {
    return "Attendance configuration is incomplete. Please reload the page and try again.";
  }
  const details = incompleteTypes
    .map((t) => {
      const missing = (t.missingFields || []).map((f) => FIELD_LABELS[f] || f).join(", ");
      return `"${t.name}" is missing: ${missing}`;
    })
    .join("; ");
  return `Attendance configuration is incomplete — ${details}. Please reload the page and start fresh.`;
};
