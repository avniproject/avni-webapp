import { find } from "lodash";

export default {
  getFirstError(validationResults) {
    return find(validationResults, each => !each.success);
  }
};
