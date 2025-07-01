import React, { Fragment } from "react";
import { GridLegacy as Grid } from "@mui/material";
import { map, startCase } from "lodash";
import Select from "react-select";
import { useDeclarativeRuleDispatch } from "./DeclarativeRuleContext";
import { findOrDefault } from "../../util";

const OperatorComponent = ({ rule, ruleIndex, conditionIndex, declarativeRuleIndex, ...props }) => {
  const dispatch = useDeclarativeRuleDispatch();

  const operators = map(rule.getApplicableOperators(), (v, k) => ({
    value: v,
    label: startCase(k)
  }));

  const onOperatorChange = operator => {
    dispatch({
      type: "operatorChange",
      payload: { declarativeRuleIndex, ruleIndex, conditionIndex, operator }
    });
  };

  return (
    <Fragment>
      <Grid item xs={3}>
        <Select
          placeholder="Select operator"
          value={findOrDefault(operators, ({ value }) => value === rule.operator, null)}
          options={operators}
          style={{ width: "auto" }}
          onChange={({ value }) => onOperatorChange(value)}
        />
      </Grid>
    </Fragment>
  );
};

export default OperatorComponent;
