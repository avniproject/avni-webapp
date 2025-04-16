import _ from "lodash";
import httpClient from "../../common/utils/httpClient";

export const CHANGE_TYPE = {
  ADDED: "Added",
  MISSING: "Missing",
  MODIFIED: "Modified",
  VOIDED: "Voided",
  NO_CHANGE: "NoChange"
};

const isNoChange = function(obj) {
  if (!_.isObject(obj)) return false;
  if (obj.changeType === CHANGE_TYPE.NO_CHANGE) return true;
  return _.every(obj, value => isNoChange(value));
};

const filterForms = function(data) {
  const filteredData = _.reduce(
    data,
    (acc, formData, formName) => {
      if (!isNoChange(formData) && formName !== "formMappings.json") {
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
    formData.append("candidateBundle", file);
    const response = await httpClient.post("/web/bundle/findChanges", formData);
    return filterForms(response.data);
  }
}

export default CompareMetadataService;
