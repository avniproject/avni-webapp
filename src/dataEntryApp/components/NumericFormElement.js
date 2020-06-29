import React, { Fragment } from "react";
import { TextField } from "@material-ui/core";
import { isNaN, isEmpty, find } from "lodash";
import { useTranslation } from "react-i18next";

export default ({ formElement: fe, value, update, validationResults, uuid }) => {
  console.log("formElement---->", fe);
  console.log("formType---->", fe.formElementGroup.form.formType);
  const formtype = fe.formElementGroup.form.formType;
  let fieldwidth = "30%";
  if (formtype === "ProgramEnrolment") {
    fieldwidth = "40%";
  }
  // formElementGroup.form.formType
  const { t } = useTranslation();
  const validationResult = find(
    validationResults,
    validationResult => validationResult.formIdentifier === uuid
  );

  return (
    <Fragment>
      <TextField
        label={t(fe.display || fe.name)}
        type={"numeric"}
        autoComplete="off"
        required={fe.mandatory}
        name={fe.name}
        value={isNaN(parseInt(value)) ? "" : value}
        style={{ width: fieldwidth }}
        helperText={validationResult && t(validationResult.messageKey, validationResult.extra)}
        error={validationResult && !validationResult.success}
        onChange={e => {
          const v = e.target.value;
          isEmpty(v) ? update(null) : update(parseInt(v));
        }}
      />
    </Fragment>
  );
};
