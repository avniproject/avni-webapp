import React from "react";
import { TextField } from "@material-ui/core";
import { isEmpty, find } from "lodash";
import { useTranslation } from "react-i18next";

export default ({ formElement: fe, value, update, validationResults, uuid }) => {
  const { t } = useTranslation();
  const formtype = fe.formElementGroup.form.formType;
  let fieldwidth = "30%";
  if (formtype === "ProgramEnrolment") {
    fieldwidth = "40%";
  }
  const validationResult = find(
    validationResults,
    validationResult => validationResult.formIdentifier === uuid
  );
  return (
    <div>
      <TextField
        label={t(fe.display || fe.name)}
        type={"text"}
        autoComplete="off"
        required={fe.mandatory}
        name={fe.name}
        value={value ? value : ""}
        style={{ width: fieldwidth }}
        helperText={validationResult && t(validationResult.messageKey, validationResult.extra)}
        error={validationResult && !validationResult.success}
        onChange={e => {
          const v = e.target.value;
          isEmpty(v) ? update() : update(v);
        }}
      />
    </div>
  );
};
