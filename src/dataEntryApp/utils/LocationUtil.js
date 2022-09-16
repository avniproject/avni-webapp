import { get, isEmpty } from "lodash";

export const locationNameRenderer = location => {
  const locName = get(location, "name", get(location, "title"));
  const locType = get(location, "type", get(location, "typeString"));
  if (isEmpty(locName)) {
    return "";
  }
  let retVal = `${locName} (${locType})`;
  let lineageParts = location.titleLineage.split(", ");
  if (lineageParts.length > 1)
    retVal += ` in ${lineageParts.slice(0, lineageParts.length - 1).join(" > ")}`;
  return retVal;
};
