import WebReportCard from "../../../common/model/WebReportCard";

export const ReportCardReducerKeys = {
  name: "name",
  description: "description",
  color: "color",
  query: "query",
  nested: "nested",
  standardReportCardType: "standardReportCardType",
  setData: "setData",
  cardFormMetaData: "cardFormMetaData",
  duration: "duration"
};

export const ReportCardReducer = (reportCard, action) => {
  switch (action.type) {
    case ReportCardReducerKeys.name:
      reportCard.name = action.payload;
      break;
    case ReportCardReducerKeys.description:
      reportCard.description = action.payload;
      break;
    case ReportCardReducerKeys.color:
      reportCard.colour = action.payload;
      break;
    case ReportCardReducerKeys.query:
      reportCard.query = action.payload;
      break;
    case ReportCardReducerKeys.nested:
      reportCard.nested = action.payload.nested;
      reportCard.count = action.payload.count;
      break;
    case ReportCardReducerKeys.standardReportCardType:
      reportCard.standardReportCardType = action.payload;
      break;
    case ReportCardReducerKeys.setData:
      return WebReportCard.clone(action.payload);
    case ReportCardReducerKeys.cardFormMetaData:
      const { subjectTypes, programs, encounterTypes } = action.payload;
      reportCard.standardReportCardInputSubjectTypes = subjectTypes;
      reportCard.standardReportCardInputPrograms = programs;
      reportCard.standardReportCardInputEncounterTypes = encounterTypes;
      break;
    case ReportCardReducerKeys.duration:
      if (action.payload) {
        const { value, unit } = action.payload;
        reportCard.standardReportCardInputRecentDuration = {};
        reportCard.standardReportCardInputRecentDuration.value = value;
        reportCard.standardReportCardInputRecentDuration.unit = unit;
      } else {
        reportCard.standardReportCardInputRecentDuration = null;
      }
      break;
    default:
      break;
  }
  return WebReportCard.clone(reportCard);
};
