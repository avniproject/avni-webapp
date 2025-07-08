import { format, isValid } from "date-fns";

export const modifiedAudit = ({ lastModifiedBy, lastModifiedDateTime, lastModifiedByUserName, modifiedDateTime }) => {
  const [date, time] = getFormattedDateTime(lastModifiedDateTime || modifiedDateTime);
  return `By ${lastModifiedBy || lastModifiedByUserName} at ${time}, ${date}`;
};

export const getFormattedDateTime = dateTime => {
  const DATE_TIME_FORMAT = `MMMM d, yyyy hh:mm a`;
  return isValid(new Date(dateTime)) ? format(new Date(dateTime), DATE_TIME_FORMAT).split("_") : ["-", "-"];
};

export const createdAudit = ({ createdBy, createdDateTime, createdByUserName }) => {
  const [date, time] = getFormattedDateTime(createdDateTime);
  return `By ${createdBy || createdByUserName} at ${time}, ${date}`;
};

export const activatedAudit = ({ lastActivatedDateTime }) => {
  const [date, time] = getFormattedDateTime(lastActivatedDateTime);
  return `At ${time}, ${date}`;
};

export function mapAuditFields(source, destination) {
  destination.createdBy = source.createdBy;
  destination.lastModifiedBy = source.lastModifiedBy;
  destination.createdDateTime = source.createdDateTime;
  destination.lastModifiedDateTime = source.lastModifiedDateTime;
  destination.lastActivatedDateTime = source.lastActivatedDateTime;
}
