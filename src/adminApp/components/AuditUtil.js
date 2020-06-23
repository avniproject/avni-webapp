import moment from "moment";

export const modifiedAudit = ({ lastModifiedBy, lastModifiedDateTime, lastModifiedByUserName }) => {
  const [date, time] = getFormattedDateTime(lastModifiedDateTime);
  return `By ${lastModifiedBy || lastModifiedByUserName} at ${time}, ${date}`;
};

export const getFormattedDateTime = dateTime => {
  const DATE_TIME_FORMAT = `MMMM D, YYYY _hh:mm a`;
  return moment(dateTime)
    .format(DATE_TIME_FORMAT)
    .split("_");
};

export const createdAudit = ({ createdBy, createdDateTime, createdByUserName }) => {
  const [date, time] = getFormattedDateTime(createdDateTime);
  return `By ${createdBy || createdByUserName} at ${time}, ${date}`;
};
