import { Grid, Input } from "@mui/material";
import { AvniFormLabel } from "../../common/components/AvniFormLabel";
import { get } from "lodash";

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
    <Grid container spacing={5}>
      <Grid size={{ xs: 12, md: 6 }}>
        <AvniFormLabel label={regexLabel} toolTipKey={regexToolTipKey} />
        <Input
          fullWidth
          id={regexID}
          value={get(subjectType, `${propertyName}.regex`, "")}
          onChange={event => dispatch({ type: regexID, payload: event.target.value })}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <AvniFormLabel label={descKeyLabel} toolTipKey={descToolTipKey} />
        <Input
          fullWidth
          id={descID}
          value={get(subjectType, `${propertyName}.descriptionKey`, "")}
          onChange={event => dispatch({ type: descID, payload: event.target.value })}
        />
      </Grid>
    </Grid>
  );
};
