import _ from "lodash";
import lodash from "lodash";
import moment from "moment";
import * as models from "avni-models";
import { FormElementStatus } from "avni-models";
import * as rulesConfig from "rules-config";
import { common, motherCalculations } from "avni-health-modules";

export const getFormElementsStatuses = (entity, formElementGroup) => {
  if ([entity, formElementGroup, formElementGroup.form].some(_.isEmpty)) return [];
  const formElementsWithRules = formElementGroup
    .getFormElements()
    .filter(formElement => !_.isNil(formElement.rule) && !_.isEmpty(_.trim(formElement.rule)));
  const formElementStatusAfterGroupRule = runFormElementGroupRule(formElementGroup, entity);
  const visibleFormElementsUUIDs = _.filter(
    formElementStatusAfterGroupRule,
    ({ visibility }) => visibility === true
  ).map(({ uuid }) => uuid);
  if (!_.isEmpty(formElementsWithRules) && !_.isEmpty(visibleFormElementsUUIDs)) {
    let formElementStatuses = formElementsWithRules
      .filter(({ uuid }) => _.includes(visibleFormElementsUUIDs, uuid))
      .map(formElement => {
        try {
          const ruleServiceLibraryInterfaceForSharingModules = getRuleServiceLibraryInterfaceForSharingModules();
          const ruleFunc = eval(formElement.rule);
          return ruleFunc({
            params: { formElement, entity },
            imports: { rulesConfig, lodash, moment, common }
          });
        } catch (e) {
          console.error(
            `Rule-Failure for formElement name: ${formElement.name} Error message : ${e}`
          );
        }
      })
      .filter(fs => !_.isNil(fs))
      .reduce((all, curr) => all.concat(curr), formElementStatusAfterGroupRule)
      .reduce((acc, fs) => acc.set(fs.uuid, fs), new Map())
      .values();
    return [...formElementStatuses];
  }
  return formElementStatusAfterGroupRule;
};

const runFormElementGroupRule = (formElementGroup, entity) => {
  if (_.isNil(formElementGroup.rule) || _.isEmpty(_.trim(formElementGroup.rule))) {
    return formElementGroup
      .getFormElements()
      .map(formElement => new FormElementStatus(formElement.uuid, true, undefined));
  }
  try {
    const ruleServiceLibraryInterfaceForSharingModules = getRuleServiceLibraryInterfaceForSharingModules();
    const ruleFunc = eval(formElementGroup.rule);
    return ruleFunc({
      params: { formElementGroup, entity },
      imports: { rulesConfig, lodash, moment, common }
    });
  } catch (e) {
    console.error(
      `Rule-Failure for formElement group name: ${formElementGroup.name} Error message : ${e}`
    );
  }
};

const getRuleServiceLibraryInterfaceForSharingModules = () => {
  return {
    log: console.log,
    common: common,
    motherCalculations: motherCalculations,
    models: models
  };
};
