import React from "react";
import { TextField, Typography } from "@material-ui/core";
import { isEmpty, find } from "lodash";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
const useStyles = makeStyles(theme => ({
  lableStyle: {
    width: "50%",
    marginBottom: 10,
    color: "rgba(0, 0, 0, 0.54)"
  }
}));

export default ({ formElement: fe, value, update, validationResults, uuid }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const validationResult = find(
    validationResults,
    validationResult => validationResult.formIdentifier === uuid
  );
  return (
    <div>
      <Typography variant="body1" gutterBottom className={classes.lableStyle}>
        {t(fe.name)}
        {fe.mandatory ? "*" : ""}
      </Typography>
      <TextField
        id={fe.name.replaceAll(" ", "-")}
        type={"text"}
        autoComplete="off"
        required={fe.mandatory}
        name={fe.name}
        value={value ? value : ""}
        style={{ width: "30%" }}
        helperText={validationResult && t(validationResult.messageKey, validationResult.extra)}
        error={validationResult && !validationResult.success}
        onChange={e => {
          const v = e.target.value;
          isEmpty(v) ? update() : update(v);
        }}
        disabled={!fe.editable}
      />
    </div>
  );
};
