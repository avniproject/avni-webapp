import WebReportCard from "../../../common/model/WebReportCard";
import { ReportCard } from "openchs-models";

export const ReportCardReducerKeys = {
  name: "name",
  description: "description",
  color: "color",
  query: "query",
  nested: "nested",
  standardReportCardType: "standardReportCardType",
  setData: "setData",
  cardFormMetaData: "cardFormMetaData",
  duration: "duration",
  action: "action",
  actionDetailSubjectTypeUUID: "actionDetailSubjectTypeUUID",
  actionDetailProgramUUID: "actionDetailProgramUUID",
  actionDetailEncounterTypeUUID: "actionDetailEncounterTypeUUID",
  actionDetailVisitType: "actionDetailVisitType",
  onActionCompletion: "onActionCompletion",
  customCardConfig: "customCardConfig",
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
    case ReportCardReducerKeys.action:
      reportCard.action = action.payload;
      if (action.payload !== ReportCard.actionTypes.DoVisit) {
        reportCard.actionDetailSubjectTypeUUID = null;
        reportCard.actionDetailProgramUUID = null;
        reportCard.actionDetailEncounterTypeUUID = null;
        reportCard.actionDetailVisitType = null;
        reportCard.onActionCompletion = null;
      } else {
        reportCard.onActionCompletion =
          ReportCard.onActionCompletionTypes.goToSubjectProfile;
      }
      break;
    case ReportCardReducerKeys.actionDetailSubjectTypeUUID:
      reportCard.actionDetailSubjectTypeUUID = action.payload;
      reportCard.actionDetailProgramUUID = null;
      reportCard.actionDetailEncounterTypeUUID = null;
      break;
    case ReportCardReducerKeys.actionDetailProgramUUID:
      reportCard.actionDetailProgramUUID = action.payload;
      reportCard.actionDetailEncounterTypeUUID = null;
      break;
    case ReportCardReducerKeys.actionDetailEncounterTypeUUID:
      reportCard.actionDetailEncounterTypeUUID = action.payload;
      break;
    case ReportCardReducerKeys.actionDetailVisitType:
      reportCard.actionDetailVisitType = action.payload;
      break;
    case ReportCardReducerKeys.onActionCompletion:
      reportCard.onActionCompletion = action.payload;
      break;
    case ReportCardReducerKeys.customCardConfig:
      reportCard.customCardConfig = action.payload;
      break;
    default:
      break;
  }
  return WebReportCard.clone(reportCard);
};
