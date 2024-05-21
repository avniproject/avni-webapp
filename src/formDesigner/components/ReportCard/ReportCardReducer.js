import WebReportCard from "../../../common/model/WebReportCard";

export const ReportCardReducerKeys = {
  name: "name",
  description: "description",
  color: "color",
  query: "query",
  nested: "nested",
  standardReportCardType: "standardReportCardType",
  setData: "setData",
  cardFormMetaData: "cardFormMetaData"
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
      reportCard.countOfCards = action.payload.count;
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
    default:
      break;
  }
  return WebReportCard.clone(reportCard);
};
