import React, { Fragment } from "react";
import { map, startCase } from "lodash";
import { LHS } from "rules-config";
import Select from "react-select";
import { Grid } from "@material-ui/core";
import { getFormType, getIsPerson, useDeclarativeRuleDispatch } from "./DeclarativeRuleContext";
import ConceptSearch from "./ConceptSearch";
import { findOrDefault } from "../../util";

const LHSComponent = ({ rule, ruleIndex, conditionIndex, declarativeRuleIndex, ...props }) => {
  const dispatch = useDeclarativeRuleDispatch();
  const types = map(LHS.getTypesBySubjectType(getIsPerson()), (v, k) => ({
    value: v,
    label: startCase(k)
  }));
  const scopes = map(LHS.getScopeByFormType(getFormType()), (v, k) => ({
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
  const selectedConceptOption = {
    label: lhs.conceptName,
    value: { name: lhs.conceptName, uuid: lhs.conceptUuid, dataType: lhs.conceptDataType }
  };

  return (
    <Fragment>
      <Grid item xs={4}>
        <Select
          placeholder="Select type"
          value={findOrDefault(types, ({ value }) => value === lhs.type, null)}
          options={types}
          style={{ width: "auto" }}
          onChange={event => onLHSChange("type", event.value)}
        />
      </Grid>
      {lhs.isScopeRequired() ? (
        <Grid item container xs={6} alignItems={"center"} direction={"row"}>
          <Grid item xs={6}>
            <ConceptSearch
              placeholder={"Type to search concept"}
              value={lhs.conceptName ? selectedConceptOption : null}
              onChange={event =>
                dispatch({
                  type: "lhsConceptChange",
                  payload: { declarativeRuleIndex, ruleIndex, conditionIndex, ...event.value }
                })
              }
              nonSupportedTypes={["NA"]}
            />
          </Grid>
          <Grid item align={"center"} xs={1}>
            {"In"}
          </Grid>
          <Grid item xs={5}>
            <Select
              placeholder="Select scope"
              value={findOrDefault(scopes, ({ value }) => value === lhs.scope, null)}
              options={scopes}
              style={{ width: "auto" }}
              onChange={event => onLHSChange("scope", event.value)}
            />
          </Grid>
        </Grid>
      ) : null}
    </Fragment>
  );
};

export default LHSComponent;
