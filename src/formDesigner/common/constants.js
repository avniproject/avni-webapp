export const constFormType = {
  ChecklistItem: "Check list item",
  Encounter: "Encounter",
  ProgramEncounter: "Program encounter",
  IndividualProfile: "Individual Profile (Registration)",
  ProgramEnrolment: "Program enrolment",
  ProgramExit: "Program exit",
  ProgramEncounterCancellation: "Program encounter cancellation"
};

const apiUrl = "https://avni.readme.io/docs/writing-rules";
const implementerURL = "https://avni.readme.io/docs/implementers-guide";

export const helperText = {
  formGroup: { text: "Each group will be shown as a seperate page in app.", url: implementerURL },
  CodedElement: { text: "Single/Multiple selection question.", url: implementerURL },
  NumericElement: { text: "Numeric question.", url: implementerURL },
  TextElement: { text: "Text based question.", url: implementerURL },
  NotesElement: { text: "Note question.", url: implementerURL },
  NAElement: { text: "NA question.", url: implementerURL },
  DateElement: { text: "Date question.", url: implementerURL },
  DateTimeElement: { text: "Datetime question.", url: implementerURL },
  TimeElement: { text: "Time question.", url: implementerURL },
  DurationElement: { text: "Duration question.", url: implementerURL },
  ImageElement: { text: "Image question.", url: implementerURL },
  IdElement: { text: "Id question.", url: implementerURL },
  VideoElement: { text: "Video question.", url: implementerURL },
  decisionRule: { text: "Used to show recommendations.", url: apiUrl },
  visitScheduleRule: { text: "Used for visit scheduling.", url: apiUrl },
  validationRule: { text: "Used to stop users from filling invalid data.", url: apiUrl },
  checklistRule: { text: "Used to add a checklist to an enrolment.", url: apiUrl },
  CodedConcept: { text: "Single/Multiple selection Concept.", url: implementerURL },
  NumericConcept: { text: "Numeric Concept.", url: implementerURL },
  TextConcept: { text: "Text based Concept.", url: implementerURL },
  NotesConcept: { text: "Note Concept.", url: implementerURL },
  NAConcept: { text: "NA Concept.", url: implementerURL },
  DateConcept: { text: "Date Concept.", url: implementerURL },
  DateTimeConcept: { text: "Datetime Concept.", url: implementerURL },
  TimeConcept: { text: "Time Concept.", url: implementerURL },
  DurationConcept: { text: "Duration Concept.", url: implementerURL },
  ImageConcept: { text: "Image Concept.", url: implementerURL },
  IdConcept: { text: "Id Concept.", url: implementerURL },
  VideoConcept: { text: "Video Concept.", url: implementerURL },
  Concept: { text: "Select concept datatype", url: implementerURL }
};
