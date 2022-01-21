import React, { Fragment } from "react";
import Grid from "@material-ui/core/Grid";
import { useDeclarativeRuleDispatch } from "./DeclarativeRuleContext";
import { map, startCase, get, zip, flatten, toNumber } from "lodash";
import { RHS, Rule } from "rules-config";
import Select from "react-select";
import { inlineConceptDataType } from "../../common/constants";
import ConceptSearch from "./ConceptSearch";
import InputField from "./InputField";
import { findOrDefault } from "../../util";

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

  const isMulti = operator === Rule.operators.ContainsAnyAnswerConceptName;
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
        <Grid item xs={3}>
          <ConceptSearch
            placeholder={"Type to search concept answer"}
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
          ) : (
            <InputField
              type={rhsValueType}
              variant="outlined"
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
