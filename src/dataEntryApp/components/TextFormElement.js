import React from "react";
import { TextField } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import _, { isEmpty, find } from "lodash";
import SubjectValidation from "../views/registration/SubjectValidation";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
const useStyles = makeStyles(theme => ({
  errmsg: {
    color: "red"
  }
}));

export default ({ formElement: fe, value, update, validationResults, uuid }) => {
  const { t } = useTranslation();
  const foundIndex = _.findIndex(validationResults, element => element.uuid === uuid);
  var validationResult;
  if (validationResults[foundIndex]) {
    validationResult = validationResults[foundIndex].validationResult;
  }

  //const validationResult = find(validationResults, element => element.uuid == uuid);
  console.log("validation result", validationResult);

  // if (validationResults[foundIndex]) {
  //   validationResults[foundIndex].validationResult = formElement.validate(value);
  // } else {
  //   validationResults.push({ "uuid": formElement.uuid, "validationResult": formElement.validate(value) });
  // }

  return (
    <div>
      <TextField
        helperText={validationResult && validationResult.messageKey}
        error={validationResult && !validationResult.success}
        label={t(fe.display || fe.name)}
        type={"text"}
        autoComplete="off"
        required={fe.mandatory}
        name={fe.name}
        value={value}
        style={{ width: "30%" }}
        onChange={e => {
          const v = e.target.value;
          isEmpty(v) ? update() : update(v);
          console.log("fe at text form elemntssss", fe);
        }}
      />
    </div>
  );
};
