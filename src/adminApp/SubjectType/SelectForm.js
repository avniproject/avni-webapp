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

  let options = convertFormListForDisplay(formList);
  return (
    <Grid container direction="row" alignItems="center" justify="flex-start">
      {!_.isEmpty(options) && (
        <Grid item>
          <DropDown
            required={!shouldCreateNewForm}
            disabled={shouldCreateNewForm}
            name={label}
            value={value}
            shrink={true}
            onChange={selectedFormName =>
              onChange(_.find(formList, form => form.formName === selectedFormName))
            }
            options={options}
          />
        </Grid>
      )}
      {!_.isEmpty(options) && (
        <Grid item style={{ width: 100, textAlign: "center" }}>
          OR
        </Grid>
      )}
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
