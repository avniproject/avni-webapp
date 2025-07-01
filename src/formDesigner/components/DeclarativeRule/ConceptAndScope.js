import React, { Fragment } from "react";
import { GridLegacy as Grid } from "@mui/material";
import ConceptSearch from "./ConceptSearch";
import Select from "react-select";
import { ConceptScope } from "rules-config";

const ConceptAndScope = ({ conceptValue, onConceptChange, defaultOptions = [], displayScope, getScopeValue, formType, onScopeChange }) => {
  const scopeOptions = ConceptScope.getScopeOptionsByFormType(formType);

  return (
    <Fragment>
      <Grid item xs={5}>
        <ConceptSearch
          placeholder={"Type to search"}
          value={conceptValue}
          onChange={({ value }) => onConceptChange(value)}
          nonSupportedTypes={["NA"]}
          defaultOptions={defaultOptions}
        />
      </Grid>
      {displayScope && (
        <Grid
          item
          container
          xs={4}
          direction={"row"}
          sx={{
            alignItems: "center"
          }}
        >
          <Grid item align={"center"} xs={1}>
            {"In"}
          </Grid>
          <Grid item xs={11}>
            <Select
              placeholder="Select scope"
              value={getScopeValue(scopeOptions)}
              options={scopeOptions}
              style={{ width: "auto" }}
              onChange={({ value }) => onScopeChange(value)}
            />
          </Grid>
        </Grid>
      )}
    </Fragment>
  );
};
export default ConceptAndScope;
