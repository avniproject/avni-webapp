import React from "react";
import TextField from "@material-ui/core/TextField";

function BasicForm({ searchFilterForms, onChange }) {
  return (
    searchFilterForms &&
    searchFilterForms.map(searchFilterForm => (
      <div>
        <div>
          {searchFilterForm.type === "Name" ? (
            <TextField
              id={searchFilterForm.titleKey}
              label={searchFilterForm.titleKey}
              type="text"
              onChange={onChange}
            />
          ) : (
            ""
          )}
        </div>
        <div>
          {searchFilterForm.type === "Age" ? (
            <TextField
              id={searchFilterForm.titleKey}
              label={searchFilterForm.titleKey}
              type="number"
              onChange={onChange}
            />
          ) : (
            ""
          )}
        </div>
        <div>
          {searchFilterForm.type === "SearchAll" ? (
            <TextField
              id={searchFilterForm.titleKey}
              label={searchFilterForm.titleKey}
              type="text"
              onChange={onChange}
            />
          ) : (
            ""
          )}
        </div>
      </div>
    ))
  );
}

BasicForm.defaultProps = {
  searchFilterForm: {}
};

export default BasicForm;
