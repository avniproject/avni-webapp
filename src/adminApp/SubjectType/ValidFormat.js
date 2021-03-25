import Grid from "@material-ui/core/Grid";
import { AvniFormLabel } from "../../common/components/AvniFormLabel";
import { Input } from "@material-ui/core";
import { get } from "lodash";
import React from "react";

export const ValidFormat = ({
  subjectType,
  dispatch,
  regexLabel,
  regexToolTipKey,
  regexID,
  descKeyLabel,
  descToolTipKey,
  descID,
  propertyName
}) => {
  return (
    <Grid container direction={"row"} spacing={5}>
      <Grid item>
        <AvniFormLabel label={regexLabel} toolTipKey={regexToolTipKey} />
        <Input
          id={regexID}
          value={get(subjectType, `${propertyName}.regex`, "")}
          onChange={event => dispatch({ type: regexID, payload: event.target.value })}
        />
      </Grid>
      <Grid item>
        <AvniFormLabel label={descKeyLabel} toolTipKey={descToolTipKey} />
        <Input
          id={descID}
          value={get(subjectType, `${propertyName}.descriptionKey`, "")}
          onChange={event => dispatch({ type: descID, payload: event.target.value })}
        />
      </Grid>
    </Grid>
  );
};
