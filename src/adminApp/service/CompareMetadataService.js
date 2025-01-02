import _ from "lodash";
import httpClient from "../../common/utils/httpClient";

export const CHANGE_TYPE = {
  ADDED: "added",
  REMOVED: "removed",
  MODIFIED: "modified",
  NO_MODIFICATION: "noModification"
};

const isNoModification = function(obj) {
  if (!_.isObject(obj)) return false;
  if (obj.changeType === CHANGE_TYPE.NO_MODIFICATION) return true;
  return _.some(obj, value => isNoModification(value));
};

const filterForms = function(data) {
  const filteredData = _.reduce(
    data,
    (acc, formData, formName) => {
      if (!isNoModification(formData) && formName !== "formMappings.json") {
        acc[formName] = formData;
      }
      return acc;
    },
    {}
  );

  return _.reduce(
    filteredData,
    (acc, formData, formName) => {
      acc[formName] = formData;
      return acc;
    },
    {}
  );
};

class CompareMetadataService {
  static async compare(file) {
    const formData = new FormData();
    formData.append("incumbentBundle", file);
    const response = await httpClient.post("/web/bundle/findChanges", formData);
    return filterForms(response.data);
  }
}

export default CompareMetadataService;
