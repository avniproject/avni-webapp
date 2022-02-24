import React, { Fragment } from "react";
import { map, startCase } from "lodash";
import { LHS } from "rules-config";
import Select from "react-select";
import { Grid } from "@material-ui/core";
import {
  getForm,
  getFormType,
  getIsPerson,
  useDeclarativeRuleDispatch
} from "./DeclarativeRuleContext";
import ConceptSearch from "./ConceptSearch";
import { findOrDefault } from "../../util";

const LHSComponent = ({ rule, ruleIndex, conditionIndex, declarativeRuleIndex, ...props }) => {
  const dispatch = useDeclarativeRuleDispatch();
  const formType = getFormType();
  const scopes = map(LHS.getScopeByFormType(formType), (v, k) => ({
    value: v,
    label: startCase(k)
  }));
  const { lhs } = rule;
  const onLHSChange = (property, value) => {
    dispatch({
      type: "lhsChange",
      payload: { declarativeRuleIndex, ruleIndex, conditionIndex, property, value }
    });
  };

  return (
    <Fragment>
      <Grid item xs={5}>
        <ConceptSearch
          placeholder={"Type to search"}
          value={lhs.getTypeOptionValue()}
          onChange={({ value }) =>
            dispatch({
              type: "typeChange",
              payload: { declarativeRuleIndex, ruleIndex, conditionIndex, formType, ...value }
            })
          }
          nonSupportedTypes={["NA"]}
          defaultOptions={lhs.getDefaultTypeOptions(getForm(), getIsPerson())}
        />
      </Grid>
      {lhs.isScopeRequired() && (
        <Grid item container xs={4} alignItems={"center"} direction={"row"}>
          <Grid item align={"center"} xs={1}>
            {"In"}
          </Grid>
          <Grid item xs={11}>
            <Select
              placeholder="Select scope"
              value={findOrDefault(scopes, ({ value }) => value === lhs.scope, null)}
              options={scopes}
              style={{ width: "auto" }}
              onChange={event => onLHSChange("scope", event.value)}
            />
          </Grid>
        </Grid>
      )}
    </Fragment>
  );
};

export default LHSComponent;
