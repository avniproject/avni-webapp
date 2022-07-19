import { sortBy } from "lodash";

export const constFormType = {
  IndividualProfile: "Subject Registration",
  ProgramEnrolment: "Program enrolment",
  ProgramEncounter: "Program encounter",
  ProgramEncounterCancellation: "Program encounter cancellation",
  ProgramExit: "Program exit",
  Encounter: "Encounter",
  IndividualEncounterCancellation: "Individual Encounter Cancellation",
  ChecklistItem: "Check list item",
  Location: "Location",
  Task: "Task"
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
