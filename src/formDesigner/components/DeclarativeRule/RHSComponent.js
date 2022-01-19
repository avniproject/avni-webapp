import React, { Fragment } from "react";
import Grid from "@material-ui/core/Grid";
import { useDeclarativeRuleDispatch } from "./DeclarativeRuleContext";
import { map, startCase, get, includes, zip, flatten, toNumber } from "lodash";
import { RHS, LHS, Rule } from "rules-config";
import Select from "react-select";
import { inlineConceptDataType } from "../../common/constants";
import ConceptSearch from "./ConceptSearch";
import InputField from "./InputField";
import { findOrDefault } from "../../util";

const RHSComponent = ({ rule, ruleIndex, conditionIndex, ...props }) => {
  const dispatch = useDeclarativeRuleDispatch();
  const { rhs, operator } = rule;
  const types = map(RHS.types, (v, k) => ({ value: v, label: startCase(k) }));
  const selectedType = get(rhs, "type");
  const isValueNumeric = includes(LHS.numericRHSValueTypes, rule.lhs.type);
  const selectedTypeOption = findOrDefault(types, ({ value }) => value === selectedType, null);
  const onRHSChange = (property, value) => {
    dispatch({ type: "rhsChange", payload: { ruleIndex, conditionIndex, property, value } });
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
            isMulti={isMulti}
            onChange={labelValues => {
              const values = isMulti ? labelValues : [labelValues];
              dispatch({
                type: "rhsConceptChange",
                payload: { ruleIndex, conditionIndex, labelValues: values }
              });
            }}
            value={isMulti ? selectedConceptAnswerOptions : flatten(selectedConceptAnswerOptions)}
            nonSupportedTypes={inlineConceptDataType}
          />
        </Grid>
      ) : null}
      {selectedType === RHS.types.Value ? (
        <Grid item xs={3}>
          <InputField
            type={isValueNumeric ? "number" : "text"}
            variant="outlined"
            value={rhs.value}
            onChange={event => {
              const value = event.target.value;
              onRHSChange("value", isValueNumeric ? toNumber(value) : value);
            }}
          />
        </Grid>
      ) : null}
    </Fragment>
  );
};

export default RHSComponent;
