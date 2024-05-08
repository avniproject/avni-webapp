import WebReportCard from "../../../common/model/WebReportCard";

export const ReportCardReducer = (reportCard, action) => {
  switch (action.type) {
    case "name":
      reportCard.name = action.payload;
      break;
    case "description":
      reportCard.description = action.payload;
      break;
    case "color":
      reportCard.colour = action.payload;
      break;
    case "query":
      reportCard.query = action.payload;
      break;
    case "nested":
      reportCard.nested = action.payload.nested;
      reportCard.countOfCards = action.payload.count;
      break;
    case "standardReportCardType":
      reportCard.standardReportCardType = action.payload;
      break;
    case "setData":
      return WebReportCard.clone(action.payload);
    default:
      break;
  }
  return WebReportCard.clone(reportCard);
};
