import { sortBy } from "lodash";

const allEntityForms = [];

class EntityFormInfo {
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

export const constFormType = {
  IndividualProfile: new EntityFormInfo("IndividualProfile", "Subject Registration", "individual"),
  ProgramEnrolment: new EntityFormInfo("ProgramEnrolment", "Program enrolment", "programEnrolment"),
  ProgramEncounter: new EntityFormInfo("ProgramEncounter", "Program encounter", "programEncounter"),
  ProgramEncounterCancellation: new EntityFormInfo(
    "ProgramEncounterCancellation",
    "Program encounter cancellation",
    "programEncounter"
  ),
  ProgramExit: new EntityFormInfo("ProgramExit", "Program exit", "programEnrolment"),
  Encounter: new EntityFormInfo("Encounter", "Encounter", "encounter"),
  IndividualEncounterCancellation: new EntityFormInfo(
    "IndividualEncounterCancellation",
    "Individual Encounter Cancellation",
    "encounter"
  ),
  ChecklistItem: new EntityFormInfo("ChecklistItem", "Check list item", "checklistItem"),
  Location: new EntityFormInfo("Location", "Location"),
  Task: new EntityFormInfo("Task", "Task", "task")
};

export const encounterFormTypes = [
  "Encounter",
  "ProgramEncounter",
  "ProgramEncounterCancellation",
  "IndividualEncounterCancellation"
];
export const programFormTypes = [
  "ProgramEncounter",
  "ProgramExit",
  "ProgramEnrolment",
  "ProgramEncounterCancellation"
];

export const inlineConceptDataType = sortBy([
  "Numeric",
  "Text",
  "Notes",
  "Coded",
  "Date",
  "DateTime",
  "Time",
  "Duration",
  "Image",
  "Id",
  "Video",
  "Subject",
  "Location",
  "PhoneNumber",
  "GroupAffiliation",
  "Audio",
  "File",
  "QuestionGroup",
  "Encounter"
]);
