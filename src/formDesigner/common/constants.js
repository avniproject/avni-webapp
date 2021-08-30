import { sortBy } from "lodash";

export const constFormType = {
  ChecklistItem: "Check list item",
  Encounter: "Encounter",
  ProgramEncounter: "Program encounter",
  IndividualProfile: "Subject Registration",
  ProgramEnrolment: "Program enrolment",
  ProgramExit: "Program exit",
  ProgramEncounterCancellation: "Program encounter cancellation",
  IndividualEncounterCancellation: "Individual Encounter Cancellation",
  Location: "Location"
};

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
  "File"
]);
