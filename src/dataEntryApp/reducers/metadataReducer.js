import { common, motherCalculations } from "avni-health-modules";
import * as models from "avni-models";
import { isEmpty, get, defaultTo } from "lodash";

const prefix = "app/dataEntry/reducer/metadata/";

export const types = {
  SET_OPERATIONAL_MODULES: `${prefix}SET_OPERATIONAL_MODULES`,
  GET_OPERATIONAL_MODULES: `${prefix}GET_OPERATIONAL_MODULES`,
  GET_GENDERS: `${prefix}GET_GENDERS`,
  SET_GENDERS: `${prefix}SET_GENDERS`,
  GET_ORGANISATION_CONFIG: `${prefix}GET_ORGANISATION_CONFIG`,
  SET_ORGANISATION_CONFIG: `${prefix}SET_ORGANISATION_CONFIG`,
  GET_LEGACY_RULES_BUNDLE: `${prefix}GET_LEGACY_RULES_BUNDLE`,
  SET_LEGACY_RULES_BUNDLE: `${prefix}SET_LEGACY_RULES_BUNDLE`,
  GET_LEGACY_RULES: `${prefix}GET_LEGACY_RULES`,
  SET_LEGACY_RULES: `${prefix}SET_LEGACY_RULES`
};

export const getOperationalModules = () => ({
  type: types.GET_OPERATIONAL_MODULES
});

export const setOperationalModules = operationalModules => ({
  type: types.SET_OPERATIONAL_MODULES,
  operationalModules
});

export const getGenders = () => ({
  type: types.GET_GENDERS
});

export const setGenders = genders => ({
  type: types.SET_GENDERS,
  genders
});

export const getOrganisationConfig = () => ({
  type: types.GET_ORGANISATION_CONFIG
});

export const setOrganisationConfig = organisationConfigs => ({
  type: types.SET_ORGANISATION_CONFIG,
  organisationConfigs
});

export const getLegacyRulesBundle = () => ({
  type: types.GET_LEGACY_RULES_BUNDLE
});

export const setLegacyRulesBundle = rulesBundle => ({
  type: types.SET_LEGACY_RULES_BUNDLE,
  rulesBundle
});

export const getLegacyRules = () => ({
  type: types.GET_LEGACY_RULES
});

export const setLegacyRules = rules => ({
  type: types.SET_LEGACY_RULES,
  rules
});

export const selectLegacyRulesBundle = state => state.dataEntry.metadata.rulesBundle;
export const selectLegacyRulesAllRules = state => state.dataEntry.metadata.allRules;
export const selectLegacyRulesBundleLoaded = state => state.dataEntry.metadata.rulesBundleLoaded;

export const selectLegacyRules = state => state.dataEntry.metadata.rules;
export const selectLegacyRulesLoaded = state => state.dataEntry.metadata.rulesLoaded;

export const selectAllAddressLevelTypes = state =>
  defaultTo(get(state, "dataEntry.metadata.operationalModules.allAddressLevels"), []);

export const selectSubjectTypes = state =>
  get(state, "dataEntry.metadata.operationalModules.subjectTypes");
const initialState = {
  rules: []
};

// reducer
export default function(state = initialState, action) {
  switch (action.type) {
    case types.SET_OPERATIONAL_MODULES: {
      return {
        ...state,
        operationalModules: action.operationalModules
      };
    }
    case types.SET_GENDERS: {
      return {
        ...state,
        genders: action.genders
      };
    }
    case types.SET_ORGANISATION_CONFIG: {
      return {
        ...state,
        organisationConfigs: action.organisationConfigs
      };
    }
    case types.SET_LEGACY_RULES_BUNDLE: {
      /**********/
      /*variables used inside the eval*/
      /*keeping it long to avoid name conflicts*/
      /* eslint-disable-next-line no-unused-vars */
      let ruleServiceLibraryInterfaceForSharingModules = {
        log: console.log,
        common: common,
        motherCalculations: motherCalculations,
        models: models
      };
      let rulesConfig = isEmpty(action.rulesBundle)
        ? {}
        : eval(action.rulesBundle.concat("rulesConfig;")); // eslint-disable-line no-eval
      /**********/
      const allRules = { ...rulesConfig };

      return {
        ...state,
        allRules,
        rulesBundleLoaded: true
      };
    }
    case types.SET_LEGACY_RULES: {
      return {
        ...state,
        rules: action.rules,
        rulesLoaded: true
      };
    }
    default:
      return state;
  }
}
