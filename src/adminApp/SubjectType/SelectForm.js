import DropDown from "../../common/components/DropDown";
import _ from "lodash";
import React, { useState } from "react";
import { Grid } from "@material-ui/core";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";

const SelectForm = ({ label = "Please select", formList, value, onChange }) => {
  const [shouldCreateNewForm, setCreateForm] = useState(false);

  const convertFormListForDisplay = (list = []) =>
    list.map(form => ({
      name: form.formName,
      value: form
    }));

  const handleCreateNewForm = event => {
    setCreateForm(event.target.checked);
    onChange(undefined);
  };

  const switchLabel = "Create new form";

  return (
    <Grid container direction="row" alignItems="center" spacing={10} justify="flex-start">
      <Grid item>
        <DropDown
          required={!shouldCreateNewForm}
          disabled={shouldCreateNewForm}
          name={label}
          value={value}
          onChange={selectedFormName =>
            onChange(_.find(formList, form => form.formName === selectedFormName))
          }
          options={convertFormListForDisplay(formList)}
        />
      </Grid>
      <Grid item>OR</Grid>
      <Grid item>
        <FormControlLabel
          control={
            <Switch
              color={"primary"}
              checked={shouldCreateNewForm}
              onChange={handleCreateNewForm}
            />
          }
          label={switchLabel}
        />
      </Grid>
    </Grid>
  );
};

export default SelectForm;
