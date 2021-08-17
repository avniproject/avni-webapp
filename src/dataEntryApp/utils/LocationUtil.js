import { isEmpty } from "lodash";

export const locationNameRenderer = location => {
  if (isEmpty(location.name)) {
    return "";
  }
  let retVal = `${location.name} (${location.type})`;
  let lineageParts = location.titleLineage.split(", ");
  if (lineageParts.length > 1)
    retVal += ` in ${lineageParts.slice(0, lineageParts.length - 1).join(" > ")}`;
  return retVal;
};
