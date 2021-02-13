export const ReportCardReducer = (reportCard, action) => {
  switch (action.type) {
    case "name":
      return { ...reportCard, name: action.payload };
    case "description":
      return { ...reportCard, description: action.payload };
    case "color":
      return { ...reportCard, color: action.payload };
    case "query":
      return { ...reportCard, query: action.payload };
    case "standardReportCardType":
      return { ...reportCard, standardReportCardType: action.payload };
    case "standardReportCardTypeId":
      return { ...reportCard, standardReportCardTypeId: action.payload };
    case "setData":
      return {
        ...reportCard,
        name: action.payload.name,
        description: action.payload.description,
        color: action.payload.color,
        query: action.payload.query,
        standardReportCardTypeId: action.payload.standardReportCardTypeId
      };
    default:
      return reportCard;
  }
};
