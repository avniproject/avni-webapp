import _ from "lodash";
import lodash from "lodash";
import moment from "moment";
import * as models from "avni-models";
import { FormElementStatus } from "avni-models";
import * as rulesConfig from "rules-config";
import { common, motherCalculations, RuleRegistry } from "avni-health-modules";
import { store } from "common/store/createStore";
import {
  selectLegacyRules,
  selectLegacyRulesAllRules
} from "dataEntryApp/reducers/metadataReducer";
import { individualService } from "./IndividualService";

const services = {
  individualService
};

export const getFormElementsStatuses = (entity, formElementGroup) => {
  if ([entity, formElementGroup, formElementGroup.form].some(_.isEmpty)) return [];
  const entityName = _.get(entity, "constructor.schema.name");

  const rulesFromTheBundle = getAllRuleItemsFor(formElementGroup.form, "ViewFilter", "Form");
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
          /* eslint-disable-next-line no-unused-vars */
          const ruleServiceLibraryInterfaceForSharingModules = getRuleServiceLibraryInterfaceForSharingModules();
          /* eslint-disable-next-line no-eval */
          const ruleFunc = eval(formElement.rule);
          return ruleFunc({
            params: { formElement, entity, services },
            imports: { rulesConfig, lodash, moment, common }
          });
        } catch (e) {
          console.error(
            `Rule-Failure for formElement name: ${formElement.name} Error message: ${
              e.message
            } stack: ${e.stack}`
          );
          return null;
        }
      })
      .filter(fs => !_.isNil(fs))
      .reduce((all, curr) => all.concat(curr), formElementStatusAfterGroupRule)
      .reduce((acc, fs) => acc.set(fs.uuid, fs), new Map())
      .values();
    return [...formElementStatuses];
  }
  if (_.isEmpty(rulesFromTheBundle)) return formElementStatusAfterGroupRule;
  return [
    ...rulesFromTheBundle
      .map(r => runRuleAndSaveFailure(r, entityName, entity, formElementGroup, new Date()))
      .reduce((all, curr) => all.concat(curr), formElementStatusAfterGroupRule)
      .reduce((acc, fs) => acc.set(fs.uuid, fs), new Map())
      .values()
  ];
};

const runFormElementGroupRule = (formElementGroup, entity) => {
  if (_.isNil(formElementGroup.rule) || _.isEmpty(_.trim(formElementGroup.rule))) {
    console.log("RuleEvaluationService", "No FEGroup rule found");
    return formElementGroup.getFormElements().flatMap(formElement => {
      if (!_.isNil(formElement.group)) {
        const questionGroupObservation = entity.findObservation(formElement.group.concept.uuid);
        const questionGroupObsValue =
          questionGroupObservation && questionGroupObservation.getValueWrapper();
        const size = questionGroupObsValue ? questionGroupObsValue.size() : 1;
        return _.range(size).map(questionGroupIndex => {
          const formElementStatus = new FormElementStatus(formElement.uuid, true, undefined);
          formElementStatus.addQuestionGroupInformation(questionGroupIndex);
          return formElementStatus;
        });
      } else {
        return new FormElementStatus(formElement.uuid, true, undefined);
      }
    });
  }
  try {
    /* eslint-disable-next-line no-unused-vars */
    const ruleServiceLibraryInterfaceForSharingModules = getRuleServiceLibraryInterfaceForSharingModules();
    /* eslint-disable-next-line no-eval */
    const ruleFunc = eval(formElementGroup.rule);
    return ruleFunc({
      params: { formElementGroup, entity, services },
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

const getAllRuleItemsFor = (entity, type, entityTypeHardCoded) => {
  const entityType = _.get(entity, "constructor.schema.name", entityTypeHardCoded);
  const applicableRules = RuleRegistry.getRulesFor(entity.uuid, type, entityType); //Core module rules
  const additionalRules = getApplicableRules(entity, type, entityType);
  const ruleItems = _.sortBy(applicableRules.concat(additionalRules), r => r.executionOrder);
  return ruleItems;
};

const getApplicableRules = (ruledEntity, ruleType, ruledEntityType) => {
  const state = store.getState();
  const legacyRules = selectLegacyRules(state);
  const rules = legacyRules
    .map(_.identity)
    .filter(
      rule =>
        rule.voided === false &&
        rule.type === ruleType &&
        rule.entity.uuid === ruledEntity.uuid &&
        rule.entity.type === ruledEntityType
    );
  return getRuleFunctions(rules);
};

const getRuleFunctions = (rules = []) => {
  const allRules = selectLegacyRulesAllRules(store.getState());
  return _.defaults(rules, [])
    .filter(ar => _.isFunction(allRules[ar.fnName]) && _.isFunction(allRules[ar.fnName].exec))
    .map(ar => ({ ...ar, fn: allRules[ar.fnName] }));
};

const runRuleAndSaveFailure = (rule, entityName, entity, ruleTypeValue, config, context) => {
  try {
    if (entityName === "WorkList") {
      ruleTypeValue = entity;
      return rule.fn.exec(entity, context);
    } else {
      return _.isNil(context)
        ? rule.fn.exec(entity, ruleTypeValue, config)
        : rule.fn.exec(entity, ruleTypeValue, context, config);
    }
  } catch (error) {
    console.log("Rule-Failure", `Rule failed: ${rule.name}, uuid: ${rule.uuid}`);
    //TODO: Implement saving rule failures by calling API
    // this.saveFailedRules(error, rule.uuid, this.getIndividualUUID(entity, entityName));
    return ruleTypeValue;
  }
};
