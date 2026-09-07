import _ from "lodash";

const allEntityForms = [];

class FormTypeInfo {
  formType;
  display;
  ruleVariableName;

  constructor(formType, display, ruleVariableName) {
    this.formType = formType;
    this.display = display;
    this.ruleVariableName = ruleVariableName;
    allEntityForms.push(this);
  }
}

export const FormTypeEntities = {
  IndividualProfile: new FormTypeInfo("IndividualProfile", "Subject registration", "individual"),
  SubjectEnrolmentEligibility: new FormTypeInfo("SubjectEnrolmentEligibility", "Subject enrolment eligibility", "individual"),
  ManualProgramEnrolmentEligibility: new FormTypeInfo("ManualProgramEnrolmentEligibility", "Manual enrolment eligibility", "individual"),
  ProgramEnrolment: new FormTypeInfo("ProgramEnrolment", "Program enrolment", "programEnrolment"),
  ProgramExit: new FormTypeInfo("ProgramExit", "Program exit", "programEnrolment"),
  ProgramEncounter: new FormTypeInfo("ProgramEncounter", "Program encounter", "programEncounter"),
  ProgramEncounterCancellation: new FormTypeInfo("ProgramEncounterCancellation", "Program encounter cancellation", "programEncounter"),
  Encounter: new FormTypeInfo("Encounter", "Encounter", "encounter"),
  IndividualEncounterCancellation: new FormTypeInfo("IndividualEncounterCancellation", "Individual Encounter Cancellation", "encounter"),
  ChecklistItem: new FormTypeInfo("ChecklistItem", "Check list item", "checklistItem"),
  Location: new FormTypeInfo("Location", "Location"),
  Task: new FormTypeInfo("Task", "Task", "task"),
  // Both write to the approval decision rather than to the record being judged, so rules on these forms
  // see entityApprovalStatus - the same relationship Task has to task.
  Approval: new FormTypeInfo("Approval", "Approval", "entityApprovalStatus"),
  Rejection: new FormTypeInfo("Rejection", "Rejection", "entityApprovalStatus"),

  getFormTypeInfo(formType) {
    return _.find(allEntityForms, (entityFormInfo) => entityFormInfo.formType === formType);
  },

  getAllFormTypeInfo() {
    return allEntityForms;
  },

  isForProgramEncounter(formTypeInfo) {
    return formTypeInfo === FormTypeEntities.ProgramEncounterCancellation || formTypeInfo === FormTypeEntities.ProgramEncounter;
  },

  isForProgramEnrolment(formTypeInfo) {
    return formTypeInfo === FormTypeEntities.ProgramEnrolment || formTypeInfo === FormTypeEntities.ProgramExit;
  },

  isForSubjectEncounter(formTypeInfo) {
    return formTypeInfo === FormTypeEntities.Encounter || formTypeInfo === FormTypeEntities.IndividualEncounterCancellation;
  },

  // Approval and Rejection are the only types shown at the moment a decision is made, and the only ones
  // that can be attached to all four subject type / programme / visit type shapes.
  isApprovalDecisionForm(formTypeInfo) {
    return formTypeInfo === FormTypeEntities.Approval || formTypeInfo === FormTypeEntities.Rejection;
  },
};

// These two decide which mapping pickers FormSettings renders. Approval and Rejection appear in both
// because they attach to all four subject type / programme / visit type shapes, so an administrator has
// to be able to choose a programme or a visit type for them.
//
// While they were absent, both flags were false and only the subject type picker rendered - leaving the
// subject-only shape as the single mapping that could be built. avni-server refuses that one whenever
// approval is switched on for a visit or programme form rather than the registration form, so the only
// mapping the screen could produce was the one that could never be valid (avniproject/avni-webapp#1807).
export const encounterFormTypes = [
  FormTypeEntities.Encounter,
  FormTypeEntities.ProgramEncounter,
  FormTypeEntities.ProgramEncounterCancellation,
  FormTypeEntities.IndividualEncounterCancellation,
  FormTypeEntities.Approval,
  FormTypeEntities.Rejection,
];

export const programFormTypes = [
  FormTypeEntities.ProgramEncounter,
  FormTypeEntities.ProgramExit,
  FormTypeEntities.ProgramEnrolment,
  FormTypeEntities.ProgramEncounterCancellation,
  FormTypeEntities.ManualProgramEnrolmentEligibility,
  FormTypeEntities.Approval,
  FormTypeEntities.Rejection,
];

export const inlineConceptDataType = _.sortBy([
  "Numeric",
  "Text",
  "Notes",
  "Coded",
  "Date",
  "DateTime",
  "Time",
  "Duration",
  "Image",
  "ImageV2",
  "Id",
  "Video",
  "Subject",
  "Location",
  "PhoneNumber",
  "GroupAffiliation",
  "Audio",
  "File",
  "QuestionGroup",
  "Encounter",
]);
