import React, { Fragment } from "react";
import { Grid } from "@mui/material";
import { getFormType, useDeclarativeRuleDispatch } from "./DeclarativeRuleContext";
import { flatten, get, isEmpty, map, startCase, toNumber, zip } from "lodash";
import { RHS, Rule } from "rules-config";
import Select from "react-select";
import { inlineConceptDataType } from "../../common/constants";
import ConceptSearch from "./ConceptSearch";
import InputField from "./InputField";
import { findOrDefault, getSelectLabelValue } from "../../util";
import LocationSearch from "../../common/LocationSearch";
import LocationTypeSearch from "../../common/LocationTypeSearch";
import ConceptAndScope from "./ConceptAndScope";

const RHSComponent = ({ rule, ruleIndex, conditionIndex, declarativeRuleIndex, ...props }) => {
  const dispatch = useDeclarativeRuleDispatch();
  const formType = getFormType();
  const { rhs, operator } = rule;
  const types = map(rule.getApplicableRHSTypes(), (v, k) => ({ value: v, label: startCase(k) }));
  const selectedType = get(rhs, "type");
  const rhsValueType = rule.getRhsValueType();
  const selectedGenderValue = findOrDefault(RHS.genderOptions, ({ value }) => value === rhs.value, null);
  const selectedTypeOption = findOrDefault(types, ({ value }) => value === selectedType, null);
  const onRHSChange = (property, value) => {
    dispatch({
      type: "rhsChange",
      payload: { declarativeRuleIndex, ruleIndex, conditionIndex, property, value }
    });
  };

  const isMulti = operator === Rule.operators.HasAnyOneAnswer;
  const selectedConceptAnswerOptions = map(zip(rhs.answerConceptNames, rhs.answerConceptUuids), ([name, uuid]) => ({
    label: name,
    value: { name, uuid, toString: () => uuid }
  }));

  function renderValueBasedOnLHS() {
    return (
      <Grid size={3}>
        {rule.lhs.isGender() ? (
          <Select
            placeholder="Select gender"
            value={selectedGenderValue}
            options={RHS.genderOptions}
            style={{ width: "auto" }}
            onChange={event => onRHSChange("value", event.value)}
          />
        ) : rule.lhs.isAddressLevel() ? (
          <LocationSearch value={getSelectLabelValue(rhs.value)} onChange={({ value }) => onRHSChange("value", value.name)} />
        ) : rule.lhs.isAddressLevelType() ? (
          <LocationTypeSearch value={getSelectLabelValue(rhs.value)} onChange={({ value }) => onRHSChange("value", value.name)} />
        ) : (
          <InputField
            type={rhsValueType}
            value={rhs.value}
            onChange={event => {
              const value = event.target.value;
              onRHSChange("value", rhsValueType === "number" ? toNumber(value) : value);
            }}
          />
        )}
      </Grid>
    );
  }

  function renderForAnswerConcept() {
    return (
      <Grid size={4}>
        <ConceptSearch
          placeholder={"Search answer"}
          isMulti={isMulti}
          onChange={labelValues => {
            const values = isMulti ? labelValues : [labelValues];
            dispatch({
              type: "rhsAnswerConceptChange",
              payload: { declarativeRuleIndex, ruleIndex, conditionIndex, labelValues: values }
            });
          }}
          value={isMulti ? selectedConceptAnswerOptions : flatten(selectedConceptAnswerOptions)}
          nonSupportedTypes={inlineConceptDataType}
        />
      </Grid>
    );
  }

  function renderForConcept() {
    return (
      <ConceptAndScope
        conceptValue={rhs.getConceptOptionValue()}
        onConceptChange={value =>
          dispatch({
            type: "rhsConceptChange",
            payload: { declarativeRuleIndex, ruleIndex, conditionIndex, ...value, formType }
          })
        }
        displayScope={!isEmpty(rhs.conceptName)}
        getScopeValue={scopeOptions => findOrDefault(scopeOptions, ({ value }) => value === rhs.scope, null)}
        formType={formType}
        onScopeChange={value => onRHSChange("scope", value)}
      />
    );
  }

  return (
    <Fragment>
      <Grid size={3}>
        <Select
          placeholder="Select type"
          value={selectedTypeOption}
          options={types}
          style={{ width: "auto" }}
          onChange={event => onRHSChange("type", event.value)}
        />
      </Grid>
      {selectedType === RHS.types.AnswerConcept && renderForAnswerConcept()}
      {selectedType === RHS.types.Value && renderValueBasedOnLHS()}
      {selectedType === RHS.types.Concept && renderForConcept()}
    </Fragment>
  );
};

export default RHSComponent;
