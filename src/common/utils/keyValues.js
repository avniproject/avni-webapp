import _ from "lodash";

const valueByKey = (model, key) => {
  const valueObject = _.find(model.keyValues, keyValue => keyValue[key] === key);
  return _.get(valueObject, "value");
};

export default {
  valueByKey
};
