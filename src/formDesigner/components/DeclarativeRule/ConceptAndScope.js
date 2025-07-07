import { Fragment } from "react";
import { Grid } from "@mui/material";
import ConceptSearch from "./ConceptSearch";
import Select from "react-select";
import { ConceptScope } from "rules-config";

const ConceptAndScope = ({ conceptValue, onConceptChange, defaultOptions = [], displayScope, getScopeValue, formType, onScopeChange }) => {
  const scopeOptions = ConceptScope.getScopeOptionsByFormType(formType);

  return (
    <Fragment>
      <Grid size={5}>
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
          container
          direction={"row"}
          sx={{
            alignItems: "center"
          }}
          size={4}
        >
          <Grid align={"center"} size={1}>
            {"In"}
          </Grid>
          <Grid size={11}>
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
