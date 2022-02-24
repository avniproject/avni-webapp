import React, { Fragment } from "react";
import Grid from "@material-ui/core/Grid";
import { useDeclarativeRuleDispatch } from "./DeclarativeRuleContext";
import { flatten, get, map, startCase, toNumber, zip } from "lodash";
import { RHS, Rule } from "rules-config";
import Select from "react-select";
import { inlineConceptDataType } from "../../common/constants";
import ConceptSearch from "./ConceptSearch";
import InputField from "./InputField";
import { findOrDefault, getSelectLabelValue } from "../../util";
import LocationSearch from "../../common/LocationSearch";
import LocationTypeSearch from "../../common/LocationTypeSearch";

const RHSComponent = ({ rule, ruleIndex, conditionIndex, declarativeRuleIndex, ...props }) => {
  const dispatch = useDeclarativeRuleDispatch();
  const { rhs, operator } = rule;
  const types = map(rule.getApplicableRHSTypes(), (v, k) => ({ value: v, label: startCase(k) }));
  const selectedType = get(rhs, "type");
  const rhsValueType = rule.getRhsValueType();
  const selectedGenderValue = findOrDefault(
    RHS.genderOptions,
    ({ value }) => value === rhs.value,
    null
  );
  const selectedTypeOption = findOrDefault(types, ({ value }) => value === selectedType, null);
  const onRHSChange = (property, value) => {
    dispatch({
      type: "rhsChange",
      payload: { declarativeRuleIndex, ruleIndex, conditionIndex, property, value }
    });
  };

  const isMulti = operator === Rule.operators.HasAnyOneAnswer;
  const selectedConceptAnswerOptions = map(
    zip(rhs.answerConceptNames, rhs.answerConceptUuids),
    ([name, uuid]) => ({ label: name, value: { name, uuid, toString: () => uuid } })
  );

  return (
    <Fragment>
      <Grid item xs={3}>
        <Select
          placeholder="Select type"
          value={selectedTypeOption}
          options={types}
          style={{ width: "auto" }}
          onChange={event => onRHSChange("type", event.value)}
        />
      </Grid>
      {selectedType === RHS.types.AnswerConcept ? (
        <Grid item xs={4}>
          <ConceptSearch
            placeholder={"Search answer"}
            isMulti={isMulti}
            onChange={labelValues => {
              const values = isMulti ? labelValues : [labelValues];
              dispatch({
                type: "rhsConceptChange",
                payload: { declarativeRuleIndex, ruleIndex, conditionIndex, labelValues: values }
              });
            }}
            value={isMulti ? selectedConceptAnswerOptions : flatten(selectedConceptAnswerOptions)}
            nonSupportedTypes={inlineConceptDataType}
          />
        </Grid>
      ) : null}
      {selectedType === RHS.types.Value ? (
        <Grid item xs={3}>
          {rule.lhs.isGender() ? (
            <Select
              placeholder="Select gender"
              value={selectedGenderValue}
              options={RHS.genderOptions}
              style={{ width: "auto" }}
              onChange={event => onRHSChange("value", event.value)}
            />
          ) : rule.lhs.isAddressLevel() ? (
            <LocationSearch
              value={getSelectLabelValue(rhs.value)}
              onChange={({ value }) => onRHSChange("value", value.name)}
            />
          ) : rule.lhs.isAddressLevelType() ? (
            <LocationTypeSearch
              value={getSelectLabelValue(rhs.value)}
              onChange={({ value }) => onRHSChange("value", value.name)}
            />
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
      ) : null}
    </Fragment>
  );
};

export default RHSComponent;
