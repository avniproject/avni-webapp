import _ from "lodash";
import lodash from "lodash";
import moment from "moment";
import * as models from "avni-models";
import { FormElementStatus } from "avni-models";
import * as rulesConfig from "rules-config";
import { common, motherCalculations, RuleRegistry } from "avni-health-modules";
import { store } from "common/store/createStore";
import { selectLegacyRules, selectLegacyRulesAllRules } from "dataEntryApp/reducers/metadataReducer";
import { individualService } from "./IndividualService";

const services = {
  individualService
};

const getImports = () => {
  return { rulesConfig, common, lodash, moment, motherCalculations, log: console.log };
};

const updateMapUsingKeyPattern = () => {
  return (acc, fs) => acc.set(`${fs.uuid}-${fs.questionGroupIndex || 0}`, fs);
};

export const getFormElementsStatuses = (entity, formElementGroup) => {
  if ([entity, formElementGroup, formElementGroup.form].some(_.isEmpty)) return [];
  const entityName = _.get(entity, "constructor.schema.name");
  const rulesFromTheBundle = getAllRuleItemsFor(formElementGroup.form, "ViewFilter", "Form");

  const mapOfBundleFormElementStatuses = !_.isEmpty(rulesFromTheBundle)
    ? rulesFromTheBundle
        .map(r => runRuleAndSaveFailure(r, entityName, entity, formElementGroup, new Date()))
        .reduce((all, curr) => all.concat(curr), [])
        .reduce(updateMapUsingKeyPattern(), new Map())
    : new Map();
  const allFEGFormElements = formElementGroup.getFormElements();
  const formElementStatusAfterGroupRule = runFormElementGroupRule(formElementGroup, entity, entityName, mapOfBundleFormElementStatuses);
  let mapOfFormElementStatuses = new Map();
  const visibleFormElementsUUIDs = _.filter(formElementStatusAfterGroupRule, ({ visibility }) => visibility === true).map(
    ({ uuid }) => uuid
  );
  const applicableFormElements = allFEGFormElements.filter(fe => _.includes(visibleFormElementsUUIDs, fe.uuid));
  if (!_.isEmpty(formElementStatusAfterGroupRule)) {
    mapOfFormElementStatuses = formElementStatusAfterGroupRule.reduce(updateMapUsingKeyPattern(), mapOfFormElementStatuses);
  }
  if (!_.isEmpty(allFEGFormElements) && !_.isEmpty(visibleFormElementsUUIDs)) {
    mapOfFormElementStatuses = applicableFormElements
      .map(formElement => {
        if (formElement.groupUuid) {
          return getTheChildFormElementStatuses(formElement, entity, entityName, mapOfBundleFormElementStatuses);
        }
        return runFormElementStatusRule(formElement, entity, entityName, null, mapOfBundleFormElementStatuses);
      })
      .filter(fs => !_.isNil(fs))
      .reduce((all, curr) => all.concat(curr), [])
      .reduce(updateMapUsingKeyPattern(), mapOfFormElementStatuses);
  }
  return [...mapOfFormElementStatuses.values()];
};

const getTheChildFormElementStatuses = (childFormElement, entity, entityName, mapOfBundleFormElementStatuses) => {
  const size = getRepeatableObservationSize(childFormElement, entity);
  return _.range(size)
    .map(questionGroupIndex => {
      const formElementStatus = runFormElementStatusRule(
        childFormElement,
        entity,
        entityName,
        questionGroupIndex,
        mapOfBundleFormElementStatuses
      );
      if (formElementStatus) formElementStatus.addQuestionGroupInformation(questionGroupIndex);
      return formElementStatus;
    })
    .filter(fs => !_.isNil(fs))
    .reduce((all, curr) => all.concat(curr), []);
};

const getRepeatableObservationSize = (formElement, entity) => {
  const parentFormElement = formElement.getParentFormElement();
  const questionGroupObservations = entity.findObservation(parentFormElement.concept.uuid);
  const questionGroupObs = questionGroupObservations && questionGroupObservations.getValueWrapper();
  return questionGroupObs ? questionGroupObs.size() : 1;
};

const runFormElementStatusRule = (formElement, entity, entityName, questionGroupIndex, mapOfBundleFormElementStatuses) => {
  if (_.isNil(formElement.rule) || _.isEmpty(_.trim(formElement.rule))) {
    return getDefaultFormElementStatusIfNotFoundInBundleFESs(mapOfBundleFormElementStatuses, {
      uuid: formElement.uuid,
      questionGroupIndex
    });
  }
  try {
    /* eslint-disable-next-line no-unused-vars */
    const ruleServiceLibraryInterfaceForSharingModules = getRuleServiceLibraryInterfaceForSharingModules();
    /* eslint-disable-next-line no-eval */
    const ruleFunc = eval(formElement.rule);
    return ruleFunc({
      params: { formElement, entity, questionGroupIndex, services },
      imports: getImports()
    });
  } catch (e) {
    console.error(`Rule-Failure for formElement name: ${formElement.name} Error message: ${e.message} stack: ${e.stack}`);
    return null;
  }
};

/**
 * When we do not have a rule defined for a FormElement,
 * check if a FormElementStatus is available for the same in mapOfBundleFormElementStatuses.
 * If yes, return that, else return a newly created default FormElementStatus.
 *
 * @param mapOfBundleFormElementStatuses
 * @param fs has two properties: uuid and questionGroupIndex
 * @returns {*}
 */
const getDefaultFormElementStatusIfNotFoundInBundleFESs = (mapOfBundleFormElementStatuses, fs) => {
  return (
    (mapOfBundleFormElementStatuses && mapOfBundleFormElementStatuses.get(`${fs.uuid}-${fs.questionGroupIndex || 0}`)) ||
    new FormElementStatus(fs.uuid, true, null)
  );
};

const runFormElementGroupRule = (formElementGroup, entity, entityName, mapOfBundleFormElementStatuses) => {
  if (_.isNil(formElementGroup.rule) || _.isEmpty(_.trim(formElementGroup.rule))) {
    return formElementGroup.getFormElements().flatMap(formElement => {
      if (formElement.groupUuid) {
        const size = getRepeatableObservationSize(formElement, entity);
        return _.range(size).map(questionGroupIndex => {
          const formElementStatus = getDefaultFormElementStatusIfNotFoundInBundleFESs(mapOfBundleFormElementStatuses, {
            uuid: formElement.uuid,
            questionGroupIndex
          });
          formElementStatus.addQuestionGroupInformation(questionGroupIndex);
          return formElementStatus;
        });
      } else {
        return getDefaultFormElementStatusIfNotFoundInBundleFESs(mapOfBundleFormElementStatuses, {
          uuid: formElement.uuid,
          questionGroupIndex: null
        });
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
      imports: getImports()
    });
  } catch (e) {
    console.error(`Rule-Failure for formElement group name: ${formElementGroup.name} Error message : ${e}`);
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
        rule.voided === false && rule.type === ruleType && rule.entity.uuid === ruledEntity.uuid && rule.entity.type === ruledEntityType
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
      return _.isNil(context) ? rule.fn.exec(entity, ruleTypeValue, config) : rule.fn.exec(entity, ruleTypeValue, context, config);
    }
  } catch (error) {
    console.log("Rule-Failure", `Rule failed: ${rule.name}, uuid: ${rule.uuid}`);
    //TODO: Implement saving rule failures by calling API
    // this.saveFailedRules(error, rule.uuid, this.getIndividualUUID(entity, entityName));
    return ruleTypeValue;
  }
};
