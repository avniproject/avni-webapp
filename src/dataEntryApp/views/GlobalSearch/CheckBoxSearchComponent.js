import { Fragment } from "react";
import { styled } from "@mui/material/styles";
import { FormControl, FormControlLabel, Checkbox, Grid } from "@mui/material";
import { useTranslation } from "react-i18next";

const StyledGrid = styled(Grid)({
  marginTop: "1%",
  marginBottom: "1%"
});

function CheckBoxSearchComponent({ label, checked, onChange }) {
  const { t } = useTranslation();
  return (
    <Fragment>
      <StyledGrid container spacing={3}>
        <Grid size={12}>
          <FormControl component="fieldset">
            <FormControlLabel
              control={<Checkbox checked={checked} onChange={onChange} color="primary" />}
              label={t(label)}
              labelPlacement="end"
            />
          </FormControl>
        </Grid>
      </StyledGrid>
    </Fragment>
  );
}

export default CheckBoxSearchComponent;
